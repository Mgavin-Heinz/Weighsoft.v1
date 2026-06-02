<?php

namespace App\Services;

use App\Models\BusinessPartner;
use App\Models\Product;
use App\Models\Site;
use App\Models\settings;
use App\Models\XeroInvoiceQueue;
use App\Models\XeroSettings;
use App\Models\XeroSyncLog;
use App\Support\XeroDateNormalizer;
use App\Support\XeroInvoiceId;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use XeroAPI\XeroPHP\Models\Accounting\Contact;
use XeroAPI\XeroPHP\Models\Accounting\Invoice;
use XeroAPI\XeroPHP\Models\Accounting\Invoices;
use XeroAPI\XeroPHP\Models\Accounting\LineItem;

class XeroInvoiceService
{
    private XeroAuthService $authService;
    private TicketPdfService $pdfService;

    public function __construct(XeroAuthService $authService, TicketPdfService $pdfService)
    {
        $this->authService = $authService;
        $this->pdfService = $pdfService;
    }

    public function queueInvoice(string $weighingHeaderId, int $companyId, array $displayData = []): XeroInvoiceQueue
    {
        Log::info("Xero invoice queued for company {$companyId}.", [
            'ticket'   => $displayData['ticket_number'] ?? $weighingHeaderId,
            'customer' => $displayData['customer_name'] ?? null,
            'product'  => $displayData['product_name'] ?? null,
        ]);

        return XeroInvoiceQueue::create([
            'weighing_header_id' => DB::raw("UUID_TO_BIN('{$weighingHeaderId}', TRUE)"),
            'company_id'         => $companyId,
            'ticket_number'      => $displayData['ticket_number'] ?? null,
            'customer_name'      => $displayData['customer_name'] ?? null,
            'product_name'       => $displayData['product_name'] ?? null,
            'net_weight'         => $displayData['net_weight'] ?? null,
            'status'             => 'pending',
        ]);
    }

    public function processInvoice(XeroInvoiceQueue $queueItem): void
    {
        Log::info("Xero processInvoice START for queue item {$queueItem->id}.", [
            'company_id'    => $queueItem->company_id,
            'ticket'        => $queueItem->ticket_number,
            'customer'      => $queueItem->customer_name,
            'product'       => $queueItem->product_name,
            'retry_count'   => $queueItem->retry_count,
        ]);

        if (XeroInvoiceId::isZeroGuid($queueItem->xero_invoice_id)) {
            $queueItem->update([
                'xero_invoice_id' => null,
                'xero_invoice_number' => null,
                'xero_status' => null,
            ]);
            $queueItem = $queueItem->fresh();
            Log::warning("Xero processInvoice normalized zero-GUID invoice ID for queue {$queueItem->id}.");
        }

        $queueItem->update(['status' => 'processing']);

        try {
            $header = DB::selectOne("
                SELECT weighingheaders.*, BIN_TO_UUID(id, TRUE) as uuid_id
                FROM weighingheaders
                WHERE id = ?
            ", [$queueItem->weighing_header_id]);

            if (!$header) {
                throw new \Exception('Weighing header not found.');
            }

            $bp = BusinessPartner::find($header->businesspartner_id);
            $product = Product::find($header->product_id);
            $xeroSettings = XeroSettings::where('company_id', $queueItem->company_id)->first();
            $weighbridgeSetting = settings::find($header->settings_id);

            if (!$xeroSettings || !$xeroSettings->isConnected()) {
                throw new \Exception('Xero is not connected for this company.');
            }

            if (!$bp) {
                throw new \Exception("Business partner not found (BP ID: {$header->businesspartner_id}).");
            }
            if (!$bp->xero_contact_id) {
                throw new \Exception("Business partner \"{$bp->name}\" (ID: {$bp->id}) is not synced to Xero.");
            }

            if (!$product) {
                throw new \Exception("Product not found (Product ID: {$header->product_id}).");
            }
            if (!$product->xero_item_id) {
                throw new \Exception("Product \"{$product->name}\" (ID: {$product->id}) is not synced to Xero.");
            }

            $api = $this->authService->getApiInstance($queueItem->company_id);
            $tenantId = $this->authService->getTenantId($queueItem->company_id);

            // Idempotency guard: never create a new Xero invoice for a queue row
            // that already has a linked Xero invoice ID.
            if (XeroInvoiceId::isUsable($queueItem->xero_invoice_id)) {
                $linkedInvoice = $this->fetchInvoiceById($api, $tenantId, (string) $queueItem->xero_invoice_id);
                if (!$linkedInvoice) {
                    throw new \Exception('Queue item has a linked Xero invoice ID, but that invoice was not returned by Xero.');
                }

                $this->syncQueueAndHeaderFromInvoice($queueItem, $linkedInvoice);
                Log::warning("Xero processInvoice skipped create for queue {$queueItem->id}: linked invoice already exists ({$queueItem->xero_invoice_id}).");
                return;
            }

            $lineItems = $this->buildLineItems($header, $product, $weighbridgeSetting, $xeroSettings);

            $contact = new Contact();
            $contact->setContactId($bp->xero_contact_id);

            $invoice = new Invoice();
            $invoice->setType(Invoice::TYPE_ACCREC);
            $invoice->setContact($contact);
            $invoice->setLineItems($lineItems);
            $invoice->setReference($header->transaction);
            $invoice->setCurrencyCode($xeroSettings->currency_code ?: 'ZAR');
            $invoice->setDate(new \DateTime());
            $invoice->setDueDate(new \DateTime('+30 days'));

            $invoiceAction = $xeroSettings->invoice_action ?? 'draft';
            $invoiceStatus = ($invoiceAction === 'draft')
                ? Invoice::STATUS_DRAFT
                : Invoice::STATUS_AUTHORISED;
            $invoice->setStatus($invoiceStatus);

            $result = $api->createInvoices($tenantId, new Invoices(['invoices' => [$invoice]]));
            $createdInvoice = $result->getInvoices()[0];

            $xeroInvoiceId = $createdInvoice->getInvoiceId();
            $xeroInvoiceNumber = $createdInvoice->getInvoiceNumber();

            Log::info("Xero invoice created: #{$xeroInvoiceNumber} ({$xeroInvoiceId}) for ticket {$queueItem->ticket_number}, status={$invoiceAction}.");

            $validationErrors = $createdInvoice->getValidationErrors() ?? [];
            foreach ($validationErrors as $err) {
                Log::warning("Xero invoice #{$xeroInvoiceNumber} validation warning: " . $err->getMessage());
            }

            $queueStatus = ($invoiceAction === 'draft') ? 'sent' : 'approved';
            $queueItem->update([
                'xero_invoice_id'     => $xeroInvoiceId,
                'xero_invoice_number' => $xeroInvoiceNumber,
                'xero_status'         => $createdInvoice->getStatus(),
                'xero_total'          => $createdInvoice->getTotal(),
                'xero_amount_paid'    => $createdInvoice->getAmountPaid(),
                'xero_amount_due'     => $createdInvoice->getAmountDue(),
                'xero_updated_at'     => XeroDateNormalizer::toUtcDateTimeString($createdInvoice->getUpdatedDateUTC()),
                'xero_last_status_sync_at' => now(),
                'status'              => $queueStatus,
            ]);

            DB::statement("
                UPDATE weighingheaders
                SET xero_invoice_id = ?, xero_invoice_status = ?, xero_invoice_status_updated_at = ?
                WHERE id = ?
            ", [$xeroInvoiceId, $createdInvoice->getStatus(), now(), $queueItem->weighing_header_id]);

            try {
                $pdfPath = $this->pdfService->generatePdf($header->uuid_id ?? $header->transaction);
                if ($pdfPath && file_exists($pdfPath)) {
                    $fileName = 'ticket_' . ($header->transaction ?: 'unknown') . '.pdf';
                    $fileContent = file_get_contents($pdfPath);
                    $api->createInvoiceAttachmentByFileName(
                        $tenantId,
                        $xeroInvoiceId,
                        $fileName,
                        $fileContent,
                        true
                    );
                    @unlink($pdfPath);
                    Log::info("PDF attached to invoice #{$xeroInvoiceNumber}: {$fileName}.");
                } else {
                    Log::warning("PDF not attached to invoice #{$xeroInvoiceNumber}: file not generated or not found (path: {$pdfPath}).");
                }
            } catch (\Exception $e) {
                Log::warning("PDF attachment failed for invoice #{$xeroInvoiceNumber} ({$xeroInvoiceId}): {$e->getMessage()}");
            }

            if ($invoiceAction === 'approved_emailed') {
                try {
                    $requestEmpty = new \XeroAPI\XeroPHP\Models\Accounting\RequestEmpty();
                    $api->emailInvoice($tenantId, $xeroInvoiceId, $requestEmpty);
                    $queueItem->update(['status' => 'emailed']);
                    Log::info("Xero invoice #{$xeroInvoiceNumber} emailed successfully.");
                } catch (\Exception $e) {
                    Log::warning("Email send failed for invoice #{$xeroInvoiceNumber} ({$xeroInvoiceId}): {$e->getMessage()}");
                }
            }

            XeroSyncLog::create([
                'company_id'     => $queueItem->company_id,
                'sync_type'      => 'invoice',
                'direction'      => 'push',
                'status'         => 'success',
                'records_synced' => 1,
            ]);

        } catch (\Exception $e) {
            Log::error("Xero invoice processing failed for queue {$queueItem->id}: {$e->getMessage()}");

            $queueItem->update([
                'status'        => 'failed',
                'error_message' => substr($e->getMessage(), 0, 65535),
                'retry_count'   => $queueItem->retry_count + 1,
                'last_retry_at' => now(),
            ]);

            XeroSyncLog::create([
                'company_id'    => $queueItem->company_id,
                'sync_type'     => 'invoice',
                'direction'     => 'push',
                'status'        => 'failed',
                'error_message' => substr($e->getMessage(), 0, 65535),
            ]);
        }
    }

    public function retryFailed(int $companyId): int
    {
        $failed = XeroInvoiceQueue::where('company_id', $companyId)
            ->where('status', 'failed')
            ->whereColumn('retry_count', '<', 'max_retries')
            ->get();

        $failed = $failed->filter(function (XeroInvoiceQueue $queueItem) {
            return !XeroInvoiceId::isUsable($queueItem->xero_invoice_id);
        })->values();

        if ($failed->isEmpty()) {
            Log::info("Xero retryFailed: no retryable failed invoices for company {$companyId}.");
            return 0;
        }

        Log::info("Xero retryFailed: retrying {$failed->count()} failed invoice(s) for company {$companyId}.", [
            'queue_ids' => $failed->pluck('id')->toArray(),
        ]);

        $retried = 0;
        foreach ($failed as $queueItem) {
            $this->processInvoice($queueItem);
            $retried++;
            sleep(1);
        }

        Log::info("Xero retryFailed: completed {$retried} retry attempt(s) for company {$companyId}.");

        return $retried;
    }

    private function fetchInvoiceById($api, string $tenantId, string $invoiceId): ?Invoice
    {
        [$result, , ] = $api->getInvoicesWithHttpInfo(
            $tenantId,
            null,
            null,
            null,
            [$invoiceId]
        );

        return $result->getInvoices()[0] ?? null;
    }

    private function syncQueueAndHeaderFromInvoice(XeroInvoiceQueue $queueItem, Invoice $invoice): void
    {
        $xeroStatus = strtoupper((string) $invoice->getStatus());
        $queueStatus = match ($xeroStatus) {
            'DRAFT', 'SUBMITTED' => 'sent',
            'AUTHORISED' => 'approved',
            default => $queueItem->status === 'failed' ? 'approved' : $queueItem->status,
        };

        $queueItem->update([
            'xero_status' => $invoice->getStatus(),
            'xero_invoice_number' => $invoice->getInvoiceNumber() ?: $queueItem->xero_invoice_number,
            'xero_total' => $invoice->getTotal(),
            'xero_amount_paid' => $invoice->getAmountPaid(),
            'xero_amount_due' => $invoice->getAmountDue(),
            'xero_updated_at' => XeroDateNormalizer::toUtcDateTimeString($invoice->getUpdatedDateUTC()),
            'xero_last_status_sync_at' => now(),
            'status' => $queueStatus,
            'error_message' => null,
        ]);

        DB::statement(
            "UPDATE weighingheaders
             SET xero_invoice_id = ?, xero_invoice_status = ?, xero_invoice_status_updated_at = ?
             WHERE id = ?",
            [
                $queueItem->xero_invoice_id,
                $invoice->getStatus(),
                now(),
                $queueItem->weighing_header_id,
            ]
        );
    }

    /**
     * Builds Xero line items to match the WeighSoft print invoice.
     * NettWeight already reflects all deductions. Base unit price prefers weighingheaders.price snapshot.
     * Optional packaging/shipping lines use per-ton snapshots and dedicated products in xero_settings.
     * VAT: same rate as main product on each line (matches UI / ReportPricingSqlHelper sum of line taxes).
     */
    private function buildLineItems($header, Product $product, ?settings $weighbridgeSetting, XeroSettings $xeroSettings): array
    {
        $site = isset($header->site_id) ? Site::find($header->site_id) : null;
        $measureType = ($site !== null) ? ($site->measure_type ?? 'kg') : 'kg';
        $qtyTons = WeighingNetToMetricTons::fromStoredNet(floatval($header->NettWeight ?: 0), $measureType);

        $unitPrice = $this->resolveBaseUnitPriceForXero($header, $product, $weighbridgeSetting);
        $vatPct = floatval($product->vat ?? 0);

        $lines = [
            $this->makeXeroLineItem($product->code, $product->name, $qtyTons, $unitPrice, $vatPct),
        ];

        $pkgRate = isset($header->contract_packaging_price_per_ton)
            ? floatval($header->contract_packaging_price_per_ton)
            : 0.0;
        if ($pkgRate > 0) {
            $pkgProduct = $this->resolveAncillaryXeroProduct(
                $xeroSettings->packaging_product_id,
                'packaging',
                $product->company_id
            );
            $lines[] = $this->makeXeroLineItem($pkgProduct->code, $pkgProduct->name, $qtyTons, $pkgRate, $vatPct);
        }

        $shipRate = isset($header->contract_shipping_price_per_ton)
            ? floatval($header->contract_shipping_price_per_ton)
            : 0.0;
        if ($shipRate > 0) {
            $shipProduct = $this->resolveAncillaryXeroProduct(
                $xeroSettings->shipping_product_id,
                'shipping',
                $product->company_id
            );
            $lines[] = $this->makeXeroLineItem($shipProduct->code, $shipProduct->name, $qtyTons, $shipRate, $vatPct);
        }

        return $lines;
    }

    private function resolveBaseUnitPriceForXero($header, Product $product, ?settings $weighbridgeSetting): float
    {
        $raw = $header->price ?? null;
        if ($raw !== null && trim((string) $raw) !== '') {
            return floatval($raw);
        }

        $goodsType = $weighbridgeSetting->goods_type ?? '0';

        return ($goodsType === '1')
            ? floatval($product->purchase_price ?? 0)
            : floatval($product->sale_price ?? 0);
    }

    private function resolveAncillaryXeroProduct(?int $productId, string $role, int $companyId): Product
    {
        if (!$productId) {
            throw new \Exception(
                "Weighing has {$role} price per ton but Xero settings have no {$role}_product_id. "
                . 'Set packaging_product_id / shipping_product_id on xero_settings to WeighSoft products synced to Xero.'
            );
        }

        $ancillary = Product::find($productId);
        if (!$ancillary) {
            throw new \Exception("Xero {$role} product not found (product ID: {$productId}).");
        }
        if ((int) $ancillary->company_id !== (int) $companyId) {
            throw new \Exception("Xero {$role} product must belong to the same company as the ticket (product ID: {$productId}).");
        }
        if (!$ancillary->xero_item_id) {
            throw new \Exception("Product \"{$ancillary->name}\" (ID: {$ancillary->id}) is not synced to Xero — required for {$role} invoice lines.");
        }

        return $ancillary;
    }

    private function makeXeroLineItem(string $itemCode, string $description, float $qtyTons, float $unitAmount, float $vatPct): LineItem
    {
        $line = new LineItem();
        $line->setItemCode($itemCode);
        $line->setDescription($description);
        $line->setQuantity($qtyTons);
        $line->setUnitAmount($unitAmount);
        if ($vatPct > 0) {
            $lineExcl = $unitAmount * $qtyTons;
            $line->setTaxAmount(round(($lineExcl * $vatPct) / 100, 2));
        }

        return $line;
    }
}
