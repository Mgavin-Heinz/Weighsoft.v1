<?php

namespace App\Services;

use App\Models\BusinessPartner;
use App\Models\Contracts;
use App\Models\Haulier;
use App\Models\Product;
use App\Models\weighingHeaders;
use App\Models\XeroSettings;
use App\Models\XeroSyncLog;
use App\Support\XeroSyncMirrorRules;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use XeroAPI\XeroPHP\Models\Accounting\Contact;
use XeroAPI\XeroPHP\Models\Accounting\Item;

class XeroSyncService
{
    private XeroAuthService $authService;

    /** Remaining calls this minute for the current tenant, updated from X-MinLimit-Remaining. */
    private int $minLimitRemaining = 60;

    /** Remaining calls today for the current tenant, updated from X-DayLimit-Remaining. */
    private int $dayLimitRemaining = 5000;

    public function __construct(XeroAuthService $authService)
    {
        $this->authService = $authService;
    }

    public function syncContacts(int $companyId): array
    {
        Log::info("Xero syncContacts START for company {$companyId}.");

        $api      = $this->authService->getApiInstance($companyId);
        $tenantId = $this->authService->getTenantId($companyId);
        $settings = XeroSettings::where('company_id', $companyId)->first();

        $pulled             = 0;
        $pushed             = 0;
        $removedArchived    = 0;
        $reconciledOrphans  = 0;
        $localPruned        = 0;
        $localPruneSkipped  = 0;

        if (!$settings) {
            Log::warning("Xero syncContacts: no XeroSettings for company {$companyId}, aborting.");
            return $this->emptyContactSyncResult(XeroSettings::SYNC_OFF);
        }

        $strictCustomers = $settings->strictMirrorCustomers();

        // ---------------------------------------------------------------
        // Phase 1: Fetch contacts from Xero (include archived only in strict mirror mode).
        // ---------------------------------------------------------------
        $allXeroContacts     = [];
        $fetchedContactIds   = [];
        $page                = 1;

        do {
            try {
                $response     = $this->xeroApiCall(fn() => $api->getContactsWithHttpInfo($tenantId, null, null, null, null, $page, $strictCustomers, null, null, null, null));
                $xeroContacts = $response->getContacts() ?? [];
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), 'invalid length') || str_contains($e->getMessage(), 'number of items must be greater than')) {
                    $xeroContacts = [];
                } else {
                    throw $e;
                }
            }

            foreach ($xeroContacts as $contact) {
                $allXeroContacts[]   = $contact;
                $fetchedContactIds[] = $contact->getContactId();
            }

            $page++;
        } while (count($xeroContacts) >= 100);

        $fetchedContactIds = array_values(array_unique(array_filter($fetchedContactIds)));
        $validXeroContactIds = $fetchedContactIds;

        Log::info("Xero sync contacts for company {$companyId}: fetched " . count($allXeroContacts) . " contacts from Xero tenant.");

        // ---------------------------------------------------------------
        // Phase 2: Match each Xero contact to a WeighSoft BP.
        // Strict mode: archived → soft-delete; restore trashed when active again; withTrashed matching.
        // Standard pull: upsert/create only (no archive deletes, no orphan reconcile, no restore).
        // ---------------------------------------------------------------
        foreach ($allXeroContacts as $xeroContact) {
            $xeroContactId = $xeroContact->getContactId();
            $xeroName      = $xeroContact->getName();
            $xeroCode      = $xeroContact->getAccountNumber();
            $status        = $xeroContact->getContactStatus();

            if ($strictCustomers && XeroSyncMirrorRules::isContactArchivedStatus($status)) {
                $bp = BusinessPartner::withTrashed()
                    ->where('company_id', $companyId)
                    ->where('xero_contact_id', $xeroContactId)
                    ->first();
                if ($bp && !$bp->trashed()) {
                    $bp->delete();
                    $removedArchived++;
                }
                continue;
            }

            $bp = $strictCustomers
                ? BusinessPartner::withTrashed()
                    ->where('company_id', $companyId)
                    ->where('xero_contact_id', $xeroContactId)
                    ->first()
                : BusinessPartner::where('company_id', $companyId)
                    ->where('xero_contact_id', $xeroContactId)
                    ->first();

            if (!$bp && $xeroCode) {
                $bp = ($strictCustomers ? BusinessPartner::withTrashed() : BusinessPartner::query())
                    ->where('company_id', $companyId)
                    ->where('code', $xeroCode)
                    ->where(function ($q) use ($validXeroContactIds) {
                        $q->whereNull('xero_contact_id');
                        if (!empty($validXeroContactIds)) {
                            $q->orWhereNotIn('xero_contact_id', $validXeroContactIds);
                        }
                    })
                    ->first();
            }

            if (!$bp && $xeroName) {
                $bp = ($strictCustomers ? BusinessPartner::withTrashed() : BusinessPartner::query())
                    ->where('company_id', $companyId)
                    ->whereRaw('LOWER(name) = ?', [strtolower($xeroName)])
                    ->where(function ($q) use ($validXeroContactIds) {
                        $q->whereNull('xero_contact_id');
                        if (!empty($validXeroContactIds)) {
                            $q->orWhereNotIn('xero_contact_id', $validXeroContactIds);
                        }
                    })
                    ->first();
            }

            if ($bp) {
                if ($strictCustomers && $bp->trashed()) {
                    $bp->restore();
                }
                $bp->update([
                    'xero_contact_id' => $xeroContactId,
                    'xero_synced_at'  => now(),
                ]);
                $pulled++;
            } elseif ($settings->shouldPullCustomers()) {
                $siteId = $this->getDefaultSiteForCompany($companyId);
                if ($siteId) {
                    BusinessPartner::create([
                        'code'            => $xeroCode ?: strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $xeroName), 0, 10)),
                        'name'            => $xeroName,
                        'company_id'      => $companyId,
                        'site_id'         => $siteId,
                        'xero_contact_id' => $xeroContactId,
                        'xero_synced_at'  => now(),
                    ]);
                    $pulled++;
                } else {
                    Log::warning("Xero sync: no default site for company {$companyId}, skipped creating BP \"{$xeroName}\" ({$xeroContactId}).");
                }
            } else {
                Log::debug("Xero sync: no WeighSoft BP match for Xero contact \"{$xeroName}\" ({$xeroContactId}), pull disabled -- skipped.");
            }
        }

        // ---------------------------------------------------------------
        // Phase 2b: Orphan reconciliation (strict mirror only).
        // ---------------------------------------------------------------
        if ($strictCustomers) {
            if ($fetchedContactIds !== []) {
                $orphanBps = BusinessPartner::where('company_id', $companyId)
                    ->whereNull('deleted_at')
                    ->whereNotNull('xero_contact_id')
                    ->whereNotIn('xero_contact_id', $fetchedContactIds)
                    ->get();

                foreach ($orphanBps as $bp) {
                    $bp->delete();
                    $reconciledOrphans++;
                }
            } else {
                Log::warning("Xero sync contacts for company {$companyId}: no contact IDs returned from Xero; skipping orphan reconciliation.");
            }
        }

        // ---------------------------------------------------------------
        // Phase 3: Push WeighSoft BPs to Xero (push direction enabled).
        // 3a: CREATE contacts that have no xero_contact_id or a stale one.
        // 3b: UPDATE contacts already linked to this Xero tenant so that
        //     name / VAT number changes made in WeighSoft are reflected.
        // ---------------------------------------------------------------
        if ($settings->shouldPushCustomers()) {

            // 3a -- CREATE: BPs with no xero_contact_id or stale ID
            $unsynced = BusinessPartner::where('company_id', $companyId)
                ->whereNull('deleted_at')
                ->where(function ($q) use ($validXeroContactIds) {
                    $q->whereNull('xero_contact_id');
                    if (!empty($validXeroContactIds)) {
                        $q->orWhereNotIn('xero_contact_id', $validXeroContactIds);
                    } else {
                        $q->orWhereNotNull('xero_contact_id');
                    }
                })
                ->get();

            Log::info("Xero sync contacts for company {$companyId}: {$unsynced->count()} BPs to CREATE in Xero.");

            // Batch up to 50 contacts per POST -- one API call instead of N.
            foreach ($unsynced->chunk(50) as $chunk) {
                try {
                    $contacts = $chunk->map(fn($bp) => $this->buildXeroContact($bp))->values()->all();

                    $result  = $this->xeroApiCall(fn() => $api->createContactsWithHttpInfo(
                        $tenantId,
                        new \XeroAPI\XeroPHP\Models\Accounting\Contacts(['contacts' => $contacts]),
                        true, // summarizeErrors: keep valid records even if some fail
                    ));

                    // Xero returns created contacts in submission order.
                    $chunkArr = $chunk->values();
                    foreach ($result->getContacts() as $idx => $created) {
                        if ($created->getContactId() && isset($chunkArr[$idx])) {
                            $chunkArr[$idx]->update([
                                'xero_contact_id' => $created->getContactId(),
                                'xero_synced_at'  => now(),
                            ]);
                            $pushed++;
                        } else {
                            // summarizeErrors=true: failed records come back with ValidationErrors instead of an ID.
                            $errors = $created->getValidationErrors() ?? [];
                            $name   = $created->getName() ?? ($chunkArr[$idx]->name ?? "index {$idx}");
                            foreach ($errors as $err) {
                                Log::error("Xero batch-create contact validation error for \"{$name}\": " . $err->getMessage());
                            }
                            if (empty($errors)) {
                                Log::warning("Xero batch-create contact returned no ID and no errors for index {$idx} (name: \"{$name}\").");
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to batch-create contacts in Xero: {$e->getMessage()}", [
                        'names' => $chunk->pluck('name')->toArray(),
                    ]);
                }
            }

            // 3b -- UPDATE: BPs already linked to this Xero tenant
            // Only push BPs that were modified in WeighSoft after their last Xero sync
            $linked = BusinessPartner::where('company_id', $companyId)
                ->whereNull('deleted_at')
                ->whereIn('xero_contact_id', $validXeroContactIds)
                ->where(function ($q) {
                    $q->whereNull('xero_synced_at')
                      ->orWhereColumn('updated_at', '>', 'xero_synced_at');
                })
                ->get();

            Log::info("Xero sync contacts for company {$companyId}: {$linked->count()} BPs to UPDATE in Xero.");

            foreach ($linked as $bp) {
                try {
                    $contact = $this->buildXeroContact($bp);
                    $contact->setContactId($bp->xero_contact_id);

                    $this->xeroApiCall(fn() => $api->updateContactWithHttpInfo(
                        $tenantId,
                        $bp->xero_contact_id,
                        new \XeroAPI\XeroPHP\Models\Accounting\Contacts(['contacts' => [$contact]]),
                    ));

                    $bp->update(['xero_synced_at' => now()]);
                    $pushed++;
                } catch (\Exception $e) {
                    Log::error("Failed to update contact {$bp->name} in Xero: {$e->getMessage()}");
                }
            }
        }

        // ---------------------------------------------------------------
        // Phase 4: Local-only prune (strict mirror only).
        // ---------------------------------------------------------------
        if ($strictCustomers && $settings->shouldPullCustomers()) {
            [$localPruned, $localPruneSkipped] = $this->pruneLocalOnlyBusinessPartners($companyId);
        }

        $settings->update(['last_customer_sync_at' => now()]);

        Log::info("Xero sync contacts complete for company {$companyId}: pulled={$pulled}, pushed={$pushed}, removed_archived={$removedArchived}, reconciled_orphans={$reconciledOrphans}, local_pruned={$localPruned}, local_prune_skipped={$localPruneSkipped}");

        return [
            'pulled'               => $pulled,
            'pushed'               => $pushed,
            'direction'            => $settings->sync_customers,
            'removed_archived'     => $removedArchived,
            'reconciled_orphans'   => $reconciledOrphans,
            'local_pruned'         => $localPruned,
            'local_prune_skipped'  => $localPruneSkipped,
        ];
    }

    public function syncItems(int $companyId): array
    {
        Log::info("Xero syncItems START for company {$companyId}.");

        $api      = $this->authService->getApiInstance($companyId);
        $tenantId = $this->authService->getTenantId($companyId);
        $settings = XeroSettings::where('company_id', $companyId)->first();

        $pulled            = 0;
        $pushed            = 0;
        $removedInactive   = 0;
        $reconciledOrphans = 0;
        $localPruned       = 0;
        $localPruneSkipped = 0;

        if (!$settings) {
            Log::warning("Xero syncItems: no XeroSettings for company {$companyId}, aborting.");
            return $this->emptyItemSyncResult(XeroSettings::SYNC_OFF);
        }

        $strictProducts = $settings->strictMirrorProducts();

        // ---------------------------------------------------------------
        // Phase 1: Fetch ALL items from this Xero tenant.
        // ---------------------------------------------------------------
        $allXeroItems     = [];
        $fetchedItemIds   = [];
        $page             = 1;

        do {
            try {
                $response  = $this->xeroApiCall(fn() => $api->getItemsWithHttpInfo($tenantId, null, null, null, null, $page));
                $xeroItems = $response->getItems() ?? [];
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), 'invalid length') || str_contains($e->getMessage(), 'number of items must be greater than')) {
                    $xeroItems = [];
                } else {
                    throw $e;
                }
            }

            foreach ($xeroItems as $item) {
                $allXeroItems[]   = $item;
                $fetchedItemIds[] = $item->getItemId();
            }

            $page++;
        } while (count($xeroItems) >= 100);

        $fetchedItemIds      = array_values(array_unique(array_filter($fetchedItemIds)));
        $validXeroItemIds    = $fetchedItemIds;

        Log::info("Xero sync items for company {$companyId}: fetched " . count($allXeroItems) . " items from Xero tenant.");

        // ---------------------------------------------------------------
        // Phase 2: Match each Xero item to a WeighSoft product.
        // Strict: inactive items → soft-delete; withTrashed + restore. Standard: upsert/create only.
        // ---------------------------------------------------------------
        foreach ($allXeroItems as $xeroItem) {
            try {
                $xeroItemId = $xeroItem->getItemId();
                $xeroCode   = $xeroItem->getCode();
                $xeroName   = $xeroItem->getName();
                $name       = trim((string)($xeroName ?? '')) ?: $xeroCode ?: ('Item-' . substr($xeroItemId, 0, 8));

                if ($strictProducts && XeroSyncMirrorRules::isItemInactiveBothChannelsFalse($xeroItem->getIsSold(), $xeroItem->getIsPurchased())) {
                    $product = Product::withTrashed()
                        ->where('company_id', $companyId)
                        ->where('xero_item_id', $xeroItemId)
                        ->first();
                    if ($product && !$product->trashed()) {
                        if ($this->softDeleteProductForMirror($product, $settings, "inactive in Xero (ItemID {$xeroItemId})")) {
                            $removedInactive++;
                        }
                    }
                    continue;
                }

                $salesPrice    = null;
                $purchasePrice = null;
                if ($xeroItem->getSalesDetails()) {
                    $salesPrice = $xeroItem->getSalesDetails()->getUnitPrice();
                }
                if ($xeroItem->getPurchaseDetails()) {
                    $purchasePrice = $xeroItem->getPurchaseDetails()->getUnitPrice();
                }
                $importedVat = $this->extractVatFromXeroItem($xeroItem);

                $product = $strictProducts
                    ? Product::withTrashed()
                        ->where('company_id', $companyId)
                        ->where('xero_item_id', $xeroItemId)
                        ->first()
                    : Product::where('company_id', $companyId)
                        ->where('xero_item_id', $xeroItemId)
                        ->first();

                if (!$product && $xeroCode) {
                    $product = ($strictProducts ? Product::withTrashed() : Product::query())
                        ->where('company_id', $companyId)
                        ->where('code', $xeroCode)
                        ->where(function ($q) use ($validXeroItemIds) {
                            $q->whereNull('xero_item_id');
                            if (!empty($validXeroItemIds)) {
                                $q->orWhereNotIn('xero_item_id', $validXeroItemIds);
                            }
                        })
                        ->first();
                }

                if (!$product && $xeroName) {
                    $product = ($strictProducts ? Product::withTrashed() : Product::query())
                        ->where('company_id', $companyId)
                        ->whereRaw('LOWER(name) = ?', [strtolower($xeroName)])
                        ->where(function ($q) use ($validXeroItemIds) {
                            $q->whereNull('xero_item_id');
                            if (!empty($validXeroItemIds)) {
                                $q->orWhereNotIn('xero_item_id', $validXeroItemIds);
                            }
                        })
                        ->first();
                }

                $updateData = [
                    'xero_item_id'   => $xeroItemId,
                    'xero_synced_at' => now(),
                ];
                if ($settings->shouldPullProducts()) {
                    if ($salesPrice !== null) {
                        $updateData['sale_price'] = $salesPrice;
                    }
                    if ($purchasePrice !== null) {
                        $updateData['purchase_price'] = $purchasePrice;
                    }
                    $updateData['vat'] = $this->normalizeImportedVat($importedVat);
                }

                if ($product) {
                    if ($strictProducts && $product->trashed()) {
                        $product->restore();
                    }
                    $product->update($updateData);
                    $pulled++;
                } elseif ($settings->shouldPullProducts()) {
                    Product::create(array_merge($updateData, [
                        'code'       => $xeroCode ?: strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $name), 0, 10)),
                        'name'       => $name,
                        'company_id' => $companyId,
                    ]));
                    $pulled++;
                } else {
                    Log::debug("Xero sync: no WeighSoft product match for Xero item \"{$name}\" ({$xeroItemId}), pull disabled -- skipped.");
                }
            } catch (\Exception $e) {
                Log::warning("Skipped Xero item {$xeroItem->getItemId()} during sync: {$e->getMessage()}");
            }
        }

        // ---------------------------------------------------------------
        // Phase 2b: Orphan products (strict mirror only).
        // ---------------------------------------------------------------
        if ($strictProducts) {
            if ($fetchedItemIds !== []) {
                $orphanProducts = Product::where('company_id', $companyId)
                    ->whereNull('deleted_at')
                    ->whereNotNull('xero_item_id')
                    ->whereNotIn('xero_item_id', $fetchedItemIds)
                    ->get();

                foreach ($orphanProducts as $product) {
                    if ($this->softDeleteProductForMirror($product, $settings, "missing from Xero item list (ItemID {$product->xero_item_id})")) {
                        $reconciledOrphans++;
                    }
                }
            } else {
                Log::warning("Xero sync items for company {$companyId}: no item IDs returned from Xero; skipping orphan reconciliation.");
            }
        }

        // ---------------------------------------------------------------
        // Phase 3: Push WeighSoft products to Xero (push direction enabled).
        // 3a: CREATE items that have no xero_item_id or a stale one.
        // 3b: UPDATE items already linked to this Xero tenant so that
        //     price / VAT changes made in WeighSoft are reflected in Xero.
        // ---------------------------------------------------------------
        if ($settings->shouldPushProducts()) {

            // 3a -- CREATE: products with no xero_item_id or stale ID
            $unsynced = Product::where('company_id', $companyId)
                ->whereNull('deleted_at')
                ->where(function ($q) use ($validXeroItemIds) {
                    $q->whereNull('xero_item_id');
                    if (!empty($validXeroItemIds)) {
                        $q->orWhereNotIn('xero_item_id', $validXeroItemIds);
                    } else {
                        $q->orWhereNotNull('xero_item_id');
                    }
                })
                ->get();

            Log::info("Xero sync items for company {$companyId}: {$unsynced->count()} products to CREATE in Xero.");

            // Filter out products with no name before batching.
            $unsyncedValid = $unsynced->filter(function ($product) {
                if (empty(trim((string)($product->name ?? '')))) {
                    Log::warning("Skipped product {$product->id} (code: {$product->code}): name is empty");
                    return false;
                }
                return true;
            })->values();

            // Batch up to 50 items per POST.
            foreach ($unsyncedValid->chunk(50) as $chunk) {
                try {
                    $items = $chunk->map(fn($p) => $this->buildXeroItem($p))->values()->all();

                    $result = $this->xeroApiCall(fn() => $api->createItemsWithHttpInfo(
                        $tenantId,
                        new \XeroAPI\XeroPHP\Models\Accounting\Items(['items' => $items]),
                        true, // summarizeErrors
                    ));

                    $chunkArr = $chunk->values();
                    foreach ($result->getItems() as $idx => $created) {
                        if ($created->getItemId() && isset($chunkArr[$idx])) {
                            $chunkArr[$idx]->update([
                                'xero_item_id'   => $created->getItemId(),
                                'xero_synced_at' => now(),
                            ]);
                            $pushed++;
                        } else {
                            $errors = $created->getValidationErrors() ?? [];
                            $name   = $created->getName() ?? ($chunkArr[$idx]->name ?? "index {$idx}");
                            foreach ($errors as $err) {
                                Log::error("Xero batch-create item validation error for \"{$name}\": " . $err->getMessage());
                            }
                            if (empty($errors)) {
                                Log::warning("Xero batch-create item returned no ID and no errors for index {$idx} (name: \"{$name}\").");
                            }
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to batch-create items in Xero: {$e->getMessage()}", [
                        'names' => $chunk->pluck('name')->toArray(),
                    ]);
                }
            }

            // 3b -- UPDATE: products already linked to this Xero tenant
            // Only push products that were modified in WeighSoft after their last Xero sync
            $linked = Product::where('company_id', $companyId)
                ->whereNull('deleted_at')
                ->whereIn('xero_item_id', $validXeroItemIds)
                ->where(function ($q) {
                    $q->whereNull('xero_synced_at')
                      ->orWhereColumn('updated_at', '>', 'xero_synced_at');
                })
                ->get();

            Log::info("Xero sync items for company {$companyId}: {$linked->count()} products to UPDATE in Xero.");

            foreach ($linked as $product) {
                if (empty(trim((string)($product->name ?? '')))) {
                    continue;
                }

                try {
                    $item = $this->buildXeroItem($product);

                    $this->xeroApiCall(fn() => $api->updateItemWithHttpInfo($tenantId, $product->xero_item_id, $item));

                    $product->update(['xero_synced_at' => now()]);
                    $pushed++;
                } catch (\Exception $e) {
                    Log::error("Failed to update item {$product->name} in Xero: {$e->getMessage()}");
                }
            }
        }

        if ($strictProducts && $settings->shouldPullProducts()) {
            $settings->refresh();
            [$localPruned, $localPruneSkipped] = $this->pruneLocalOnlyProducts($companyId, $settings);
        }

        $settings->update(['last_product_sync_at' => now()]);

        Log::info("Xero sync items complete for company {$companyId}: pulled={$pulled}, pushed={$pushed}, removed_inactive={$removedInactive}, reconciled_orphans={$reconciledOrphans}, local_pruned={$localPruned}, local_prune_skipped={$localPruneSkipped}");

        return [
            'pulled'               => $pulled,
            'pushed'               => $pushed,
            'direction'            => $settings->sync_products,
            'removed_inactive'     => $removedInactive,
            'reconciled_orphans'   => $reconciledOrphans,
            'local_pruned'         => $localPruned,
            'local_prune_skipped'  => $localPruneSkipped,
        ];
    }

    public function syncAll(int $companyId): array
    {
        Log::info("Xero syncAll START for company {$companyId}.");

        $contactResult  = ['pulled' => 0, 'pushed' => 0];
        $itemResult     = ['pulled' => 0, 'pushed' => 0];
        $dailyLimitHit  = false;

        $settings = XeroSettings::where('company_id', $companyId)->first();

        if (!$settings) {
            Log::warning("Xero syncAll: no XeroSettings found for company {$companyId}, aborting.");
            return ['customers' => $contactResult, 'items' => $itemResult];
        }

        if (Cache::has($this->dailyLimitCacheKey($companyId))) {
            $unlocksAt = Cache::get($this->dailyLimitCacheKey($companyId));
            Log::info("Xero syncAll: daily API limit active for company {$companyId} until {$unlocksAt}. Skipping sync run.");
            return ['customers' => $contactResult, 'items' => $itemResult];
        }

        if ($settings->isSyncEnabled('customers')) {
            $direction = $this->mapDirectionForLog($settings->sync_customers);
            try {
                $contactResult = $this->syncContacts($companyId);
                XeroSyncLog::create([
                    'company_id'     => $companyId,
                    'sync_type'      => 'customers',
                    'direction'      => $direction,
                    'status'         => 'success',
                    'records_synced' => $contactResult['pulled'] + $contactResult['pushed'],
                ]);
            } catch (\Exception $e) {
                $dailyLimitHit = $this->isDailyLimitException($e);
                if ($dailyLimitHit) {
                    $this->storeDailyLimitFromException($companyId, $e);
                }
                Log::error("Customer sync failed for company {$companyId}: {$e->getMessage()}");
                XeroSyncLog::create([
                    'company_id'    => $companyId,
                    'sync_type'     => 'customers',
                    'direction'     => $direction,
                    'status'        => 'failed',
                    'error_message' => substr($e->getMessage(), 0, 65535),
                ]);
            }
        } else {
            Log::info("Xero syncAll: customer sync disabled for company {$companyId}, skipping.");
        }

        if ($dailyLimitHit) {
            Log::warning("Xero syncAll: skipping product sync for company {$companyId} -- daily API limit already exhausted.");
        } elseif ($settings->isSyncEnabled('products')) {
            $direction = $this->mapDirectionForLog($settings->sync_products);
            try {
                $itemResult = $this->syncItems($companyId);
                XeroSyncLog::create([
                    'company_id'     => $companyId,
                    'sync_type'      => 'products',
                    'direction'      => $direction,
                    'status'         => 'success',
                    'records_synced' => $itemResult['pulled'] + $itemResult['pushed'],
                ]);
            } catch (\Exception $e) {
                if ($this->isDailyLimitException($e)) {
                    $this->storeDailyLimitFromException($companyId, $e);
                }
                Log::error("Product sync failed for company {$companyId}: {$e->getMessage()}");
                XeroSyncLog::create([
                    'company_id'    => $companyId,
                    'sync_type'     => 'products',
                    'direction'     => $direction,
                    'status'        => 'failed',
                    'error_message' => substr($e->getMessage(), 0, 65535),
                ]);
            }
        } else {
            Log::info("Xero syncAll: product sync disabled for company {$companyId}, skipping.");
        }

        Log::info("Xero syncAll COMPLETE for company {$companyId}.", [
            'customers_pulled' => $contactResult['pulled'],
            'customers_pushed' => $contactResult['pushed'],
            'items_pulled'     => $itemResult['pulled'],
            'items_pushed'     => $itemResult['pushed'],
        ]);

        return [
            'customers' => $contactResult,
            'items'     => $itemResult,
        ];
    }

    /**
     * Execute a Xero API call using a *WithHttpInfo() SDK method.
     *
     * The callable must return [data, statusCode, headers] (i.e. call the
     * *WithHttpInfo variant so we always receive the rate-limit headers).
     *
     * Before every call we check our tracked X-MinLimit-Remaining. If it is
     * at or below a small safety threshold we pause exactly as long as
     * Xero's Retry-After instructs on a 429, or 60 s as a conservative
     * fallback when we are acting proactively.
     *
     * On a 429 we honour the Retry-After header precisely -- no minimum
     * floor, because Xero already accounts for the remaining window time.
     * We retry once; if that also 429s we re-throw so the caller can log.
     */
    private function xeroApiCall(callable $call): mixed
    {
        if ($this->minLimitRemaining <= 2) {
            Log::info("Xero rate limit low (X-MinLimit-Remaining={$this->minLimitRemaining}), pausing 60s.");
            sleep(60);
            $this->minLimitRemaining = 60;
        }

        try {
            [$result, , $headers] = $call();
            $this->updateLimitsFromHeaders($headers);
            return $result;
        } catch (\Throwable $e) {
            // Catch broadly: sometimes the SDK throws ApiException, sometimes Guzzle's
            // ClientException escapes directly. Both need the same 429 handling.
            [$httpCode, $rateHeaders] = $this->extract429Info($e);

            if ($httpCode === 429) {
                $retryAfter = isset($rateHeaders['Retry-After'][0]) ? (int) $rateHeaders['Retry-After'][0] : 60;
                $problem    = strtolower(trim(
                    $rateHeaders['X-Rate-Limit-Problem'][0] ??
                    $rateHeaders['x-rate-limit-problem'][0] ??
                    'unknown'
                ));

                if ($problem === 'day') {
                    $hours = round($retryAfter / 3600, 1);
                    Log::error("Xero daily API limit exhausted. Retry-After={$retryAfter}s (~{$hours}h). Sync aborted for today.");
                    throw $e;
                }

                // Minute limit (60/min): honour Retry-After and retry once.
                Log::warning("Xero 429: limit={$problem}, Retry-After={$retryAfter}s. Waiting then retrying once.");
                sleep(max($retryAfter, 1));
                $this->minLimitRemaining = 60;

                [$result, , $retryHeaders] = $call();
                $this->updateLimitsFromHeaders($retryHeaders);
                return $result;
            }
            throw $e;
        }
    }

    /**
     * Extract [httpStatusCode, headersArray] from any exception that may carry
     * an HTTP response. Handles both XeroAPI\ApiException and raw Guzzle exceptions.
     *
     * @return array{int, array<string, string[]>}
     */
    private function extract429Info(\Throwable $e): array
    {
        if ($e instanceof \XeroAPI\XeroPHP\ApiException) {
            return [$e->getCode(), $e->getResponseHeaders() ?? []];
        }
        if ($e instanceof \GuzzleHttp\Exception\RequestException && $e->hasResponse()) {
            $response = $e->getResponse();
            return [$response->getStatusCode(), $response->getHeaders()];
        }
        return [0, []];
    }

    /**
     * Return true if the exception is a Xero 429 caused by the DAILY limit.
     * Used by syncAll to skip subsequent syncs rather than hitting Xero again.
     */
    private function isDailyLimitException(\Throwable $e): bool
    {
        [$httpCode, $headers] = $this->extract429Info($e);
        if ($httpCode !== 429) {
            return false;
        }
        $problem = strtolower(trim(
            $headers['X-Rate-Limit-Problem'][0] ??
            $headers['x-rate-limit-problem'][0] ??
            ''
        ));
        return $problem === 'day';
    }

    /** Cache key used to block sync runs while the Xero daily limit is active. */
    private function dailyLimitCacheKey(int $companyId): string
    {
        return "xero_daily_limit_company_{$companyId}";
    }

    /**
     * Persist the daily-limit block in the Laravel cache so subsequent
     * scheduler runs skip the sync without making any API calls.
     * The cache entry expires automatically when Xero lifts the limit.
     */
    private function storeDailyLimitFromException(int $companyId, \Throwable $e): void
    {
        [, $headers] = $this->extract429Info($e);
        $retryAfter  = isset($headers['Retry-After'][0]) ? (int) $headers['Retry-After'][0] : 3600;
        $unlocksAt   = now()->addSeconds($retryAfter);

        Cache::put($this->dailyLimitCacheKey($companyId), $unlocksAt->toDateTimeString(), $retryAfter);

        Log::warning("Xero daily limit cached for company {$companyId}: sync blocked until {$unlocksAt->toDateTimeString()} ({$retryAfter}s).");
    }

    /**
     * Read X-MinLimit-Remaining and X-DayLimit-Remaining from response headers
     * returned by a *WithHttpInfo() SDK call and update our local counters.
     * Headers arrive as ['Header-Name' => ['value'], ...] (Guzzle format).
     *
     * @param array<string, string[]> $headers
     */
    private function updateLimitsFromHeaders(array $headers): void
    {
        if (isset($headers['X-MinLimit-Remaining'][0])) {
            $this->minLimitRemaining = (int) $headers['X-MinLimit-Remaining'][0];
        }
        if (isset($headers['X-DayLimit-Remaining'][0])) {
            $this->dayLimitRemaining = (int) $headers['X-DayLimit-Remaining'][0];
        }
    }

    /**
     * Build a Xero Contact object from a WeighSoft business partner.
     * Used for both create and update so the same fields are always sent.
     */
    private function buildXeroContact(BusinessPartner $bp): Contact
    {
        $contact = new Contact();
        $contact->setName($bp->name);
        $contact->setAccountNumber($bp->code);

        if ($bp->vat_nr) {
            $contact->setTaxNumber($bp->vat_nr);
        }

        return $contact;
    }

    /**
     * Build a Xero Item object from a WeighSoft product.
     * Used for both create and update so the same fields are always sent.
     */
    private function buildXeroItem(Product $product): Item
    {
        $item = new Item();
        $item->setCode($product->code);
        $item->setName($product->name);

        if ($product->sale_price) {
            $salesDetails = new \XeroAPI\XeroPHP\Models\Accounting\Purchase();
            $salesDetails->setUnitPrice(floatval($product->sale_price));
            $taxType = $this->mapVatToXeroTaxType($product->vat, 'sales');
            if ($taxType) {
                $salesDetails->setTaxType($taxType);
            }
            $item->setSalesDetails($salesDetails);
        }

        if ($product->purchase_price) {
            $purchaseDetails = new \XeroAPI\XeroPHP\Models\Accounting\Purchase();
            $purchaseDetails->setUnitPrice(floatval($product->purchase_price));
            $taxType = $this->mapVatToXeroTaxType($product->vat, 'purchase');
            if ($taxType) {
                $purchaseDetails->setTaxType($taxType);
            }
            $item->setPurchaseDetails($purchaseDetails);
        }

        return $item;
    }

    /**
     * Map a WeighSoft VAT percentage to a Xero tax type code (South Africa).
     * 15% → OUTPUT2 (sales) / INPUT2 (purchase)
     *  0% → NONE
     */
    private function mapVatToXeroTaxType(?string $vatPercent, string $direction = 'sales'): ?string
    {
        if ($vatPercent === null || $vatPercent === '' || floatval($vatPercent) == 0) {
            return 'NONE';
        }

        $rate = floatval($vatPercent);

        if ($rate >= 15) {
            return $direction === 'purchase' ? 'INPUT2' : 'OUTPUT2';
        }

        // Unknown rate -- let Xero use the item's default
        return null;
    }

    /**
     * Extract a VAT percentage from a Xero Item tax type.
     * For product sync policy, any recognized Xero tax type maps to 15.
     * Returns null only when tax type is absent/empty so normalizer can apply fallback.
     */
    private function extractVatFromXeroItem(Item $item): ?string
    {
        $salesTaxType = $item->getSalesDetails() ? $item->getSalesDetails()->getTaxType() : null;
        $purchaseTaxType = $item->getPurchaseDetails() ? $item->getPurchaseDetails()->getTaxType() : null;
        $taxType = $salesTaxType ?: $purchaseTaxType;

        if ($taxType === null || trim((string) $taxType) === '') {
            return null;
        }

        return '15';
    }

    /**
     * Normalize VAT imported from Xero for local product storage.
     * For Xero product imports, enforce deterministic 15% VAT.
     */
    private function normalizeImportedVat(mixed $vat): string
    {
        return '15';
    }

    /**
     * @return array{pulled: int, pushed: int, direction: string, removed_archived: int, reconciled_orphans: int, local_pruned: int, local_prune_skipped: int}
     */
    private function emptyContactSyncResult(string $direction): array
    {
        return [
            'pulled'              => 0,
            'pushed'              => 0,
            'direction'           => $direction,
            'removed_archived'    => 0,
            'reconciled_orphans'  => 0,
            'local_pruned'        => 0,
            'local_prune_skipped' => 0,
        ];
    }

    /**
     * @return array{pulled: int, pushed: int, direction: string, removed_inactive: int, reconciled_orphans: int, local_pruned: int, local_prune_skipped: int}
     */
    private function emptyItemSyncResult(string $direction): array
    {
        return [
            'pulled'              => 0,
            'pushed'              => 0,
            'direction'           => $direction,
            'removed_inactive'    => 0,
            'reconciled_orphans'  => 0,
            'local_pruned'        => 0,
            'local_prune_skipped' => 0,
        ];
    }

    private function softDeleteProductForMirror(Product $product, XeroSettings $settings, string $reason): bool
    {
        if ($product->trashed()) {
            return false;
        }
        $this->clearPackagingShippingIfProduct((int) $settings->company_id, (int) $product->id);
        $product->delete();
        Log::info("Xero sync: soft-deleted product {$product->id} — {$reason}");

        return true;
    }

    private function clearPackagingShippingIfProduct(int $companyId, int $productId): void
    {
        $xeroSettings = XeroSettings::where('company_id', $companyId)->first();
        if (!$xeroSettings) {
            return;
        }
        $dirty = false;
        if ((int) $xeroSettings->packaging_product_id === $productId) {
            $xeroSettings->packaging_product_id = null;
            $dirty = true;
        }
        if ((int) $xeroSettings->shipping_product_id === $productId) {
            $xeroSettings->shipping_product_id = null;
            $dirty = true;
        }
        if ($dirty) {
            $xeroSettings->save();
            Log::warning("Xero sync: cleared packaging/shipping product mapping for company {$companyId} after removing product {$productId}.");
        }
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function pruneLocalOnlyBusinessPartners(int $companyId): array
    {
        $pruned  = 0;
        $skipped = 0;
        $bps     = BusinessPartner::where('company_id', $companyId)
            ->whereNull('xero_contact_id')
            ->whereNull('deleted_at')
            ->get();

        foreach ($bps as $bp) {
            if ($this->businessPartnerHasBlockingReferences((int) $bp->id, $companyId)) {
                Log::info("Xero strict catalog: skipped pruning local-only business partner {$bp->id} ({$bp->name}) — referenced by weighings, contracts, or hauliers.");
                $skipped++;
                continue;
            }
            $bp->delete();
            $pruned++;
        }

        return [$pruned, $skipped];
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function pruneLocalOnlyProducts(int $companyId, XeroSettings $settings): array
    {
        $pruned  = 0;
        $skipped = 0;
        $rows    = Product::where('company_id', $companyId)
            ->whereNull('xero_item_id')
            ->whereNull('deleted_at')
            ->get();

        foreach ($rows as $product) {
            if ($this->productHasBlockingReferences((int) $product->id, $companyId, $settings)) {
                Log::info("Xero strict catalog: skipped pruning local-only product {$product->id} ({$product->name}) — referenced by weighings, contracts, or Xero line-item settings.");
                $skipped++;
                continue;
            }
            $product->delete();
            $pruned++;
        }

        return [$pruned, $skipped];
    }

    private function businessPartnerHasBlockingReferences(int $businessPartnerId, int $companyId): bool
    {
        if (weighingHeaders::where('company_id', $companyId)->where('businesspartner_id', $businessPartnerId)->exists()) {
            return true;
        }
        if (Contracts::where('company_id', $companyId)->where('businesspartner_id', $businessPartnerId)->exists()) {
            return true;
        }
        if (Haulier::where('company_id', $companyId)->where('business_partner_id', $businessPartnerId)->exists()) {
            return true;
        }

        return false;
    }

    private function productHasBlockingReferences(int $productId, int $companyId, XeroSettings $settings): bool
    {
        if ((int) $settings->packaging_product_id === $productId || (int) $settings->shipping_product_id === $productId) {
            return true;
        }
        if (weighingHeaders::where('company_id', $companyId)->where('product_id', $productId)->exists()) {
            return true;
        }
        if (Contracts::where('company_id', $companyId)->where('product_id', $productId)->exists()) {
            return true;
        }

        return false;
    }

    private function mapDirectionForLog(string $syncDirection): string
    {
        return match ($syncDirection) {
            XeroSettings::SYNC_XERO_TO_WEIGHSOFT => 'pull',
            XeroSettings::SYNC_STRICT_XERO_TO_WEIGHSOFT => 'strict_pull',
            XeroSettings::SYNC_WEIGHSOFT_TO_XERO => 'push',
            XeroSettings::SYNC_BIDIRECTIONAL     => 'both',
            default                               => 'both',
        };
    }

    private function getDefaultSiteForCompany(int $companyId): ?int
    {
        $site = \App\Models\Site::where('company_id', $companyId)->first();
        return $site ? $site->id : null;
    }
}
