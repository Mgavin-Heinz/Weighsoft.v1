<?php

namespace App\Http\Controllers;

use App\Models\XeroInvoiceQueue;
use App\Models\XeroSettings;
use App\Models\XeroSyncLog;
use App\Services\XeroAuthService;
use App\Services\XeroInvoiceService;
use App\Services\XeroInvoiceStatusService;
use App\Services\XeroSyncService;
use App\Support\XeroInvoiceId;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XeroController extends JwtAuthController
{
    private XeroAuthService $authService;
    private XeroSyncService $syncService;
    private XeroInvoiceService $invoiceService;
    private XeroInvoiceStatusService $invoiceStatusService;

    public function __construct(
        XeroAuthService $authService,
        XeroSyncService $syncService,
        XeroInvoiceService $invoiceService,
        XeroInvoiceStatusService $invoiceStatusService
    ) {
        parent::__construct();
        $this->authService = $authService;
        $this->syncService = $syncService;
        $this->invoiceService = $invoiceService;
        $this->invoiceStatusService = $invoiceStatusService;
    }

    public function getSettings(int $companyId): JsonResponse
    {
        $settings = XeroSettings::where('company_id', $companyId)->first();

        if (!$settings) {
            $settings = XeroSettings::create([
                'company_id'     => $companyId,
                'sync_customers' => XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
                'sync_products'  => XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
            ]);
        }

        return response()->json($settings);
    }

    public function updateSettings(Request $request, int $companyId): JsonResponse
    {
        $settings = XeroSettings::where('company_id', $companyId)->first();

        if (!$settings) {
            $settings = XeroSettings::create([
                'company_id'     => $companyId,
                'sync_customers' => XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
                'sync_products'  => XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
            ]);
        }

        $payload = $request->only([
            'xero_enabled',
            'sync_customers',
            'sync_products',
            'auto_create_invoices',
            'invoice_action',
            'sync_frequency_minutes',
            'currency_code',
        ]);

        if (array_key_exists('sync_customers', $payload)) {
            $payload['sync_customers'] = XeroSettings::normalizedSyncDirection($payload['sync_customers'] ?? null);
        }
        if (array_key_exists('sync_products', $payload)) {
            $payload['sync_products'] = XeroSettings::normalizedSyncDirection($payload['sync_products'] ?? null);
        }

        $settings->update($payload);

        return response()->json($settings->fresh());
    }

    public function connect(int $companyId): JsonResponse
    {
        try {
            $authUrl = $this->authService->getAuthorizationUrl($companyId);
            return response()->json(['auth_url' => $authUrl]);
        } catch (\Exception $e) {
            Log::error("Xero connect failed: {$e->getMessage()}");
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function disconnect(int $companyId): JsonResponse
    {
        try {
            $this->authService->disconnect($companyId);
            return response()->json(['message' => 'Disconnected from Xero.']);
        } catch (\Exception $e) {
            Log::error("Xero disconnect failed: {$e->getMessage()}");
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function syncAll(int $companyId): JsonResponse
    {
        try {
            $result = $this->syncService->syncAll($companyId);
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Xero sync all failed: {$e->getMessage()}");
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function syncCustomers(int $companyId): JsonResponse
    {
        $settings = XeroSettings::where('company_id', $companyId)->first();
        $direction = $settings ? $this->mapDirection($settings->sync_customers) : 'both';

        try {
            $result = $this->syncService->syncContacts($companyId);

            XeroSyncLog::create([
                'company_id'     => $companyId,
                'sync_type'      => 'customers',
                'direction'      => $direction,
                'status'         => 'success',
                'records_synced' => $result['pulled'] + $result['pushed'],
            ]);

            return response()->json($result);
        } catch (\Exception $e) {
            XeroSyncLog::create([
                'company_id'    => $companyId,
                'sync_type'     => 'customers',
                'direction'     => $direction,
                'status'        => 'failed',
                'error_message' => substr($e->getMessage(), 0, 65535),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function syncItems(int $companyId): JsonResponse
    {
        $settings = XeroSettings::where('company_id', $companyId)->first();
        $direction = $settings ? $this->mapDirection($settings->sync_products) : 'both';

        try {
            $result = $this->syncService->syncItems($companyId);

            XeroSyncLog::create([
                'company_id'     => $companyId,
                'sync_type'      => 'products',
                'direction'      => $direction,
                'status'         => 'success',
                'records_synced' => $result['pulled'] + $result['pushed'],
            ]);

            return response()->json($result);
        } catch (\Exception $e) {
            XeroSyncLog::create([
                'company_id'    => $companyId,
                'sync_type'     => 'products',
                'direction'     => $direction,
                'status'        => 'failed',
                'error_message' => substr($e->getMessage(), 0, 65535),
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function mapDirection(string $syncSetting): string
    {
        return match ($syncSetting) {
            'xero_to_weighsoft' => 'pull',
            'strict_xero_to_weighsoft' => 'strict_pull',
            'weighsoft_to_xero' => 'push',
            'bidirectional'     => 'both',
            default             => 'both',
        };
    }

    public function invoiceQueue(int $companyId): JsonResponse
    {
        $queue = XeroInvoiceQueue::where('company_id', $companyId)
            ->select([
                'id',
                'company_id',
                'weighing_header_id',
                'ticket_number',
                'customer_name',
                'product_name',
                'net_weight',
                'xero_invoice_id',
                'xero_invoice_number',
                'xero_status',
                'xero_total',
                'xero_amount_paid',
                'xero_amount_due',
                'xero_updated_at',
                'xero_last_status_sync_at',
                'status',
                'retry_count',
                'max_retries',
                'error_message',
                'status_sync_error',
                'last_retry_at',
                'created_at',
                'updated_at',
            ])
            ->orderBy('created_at', 'desc')
            ->limit(200)
            ->get();

        return response()->json($queue);
    }

    public function retryInvoice(int $queueId): JsonResponse
    {
        $queueItem = XeroInvoiceQueue::find($queueId);

        if (!$queueItem) {
            return response()->json(['error' => 'Queue item not found.'], 404);
        }

        if (XeroInvoiceId::isUsable($queueItem->xero_invoice_id)) {
            return response()->json([
                'error' => 'This queue item already has a Xero invoice. Use Refresh Invoice Statuses, Void, or Delete instead of Retry.'
            ], 409);
        }

        if (!$queueItem->canRetry()) {
            return response()->json(['error' => 'Maximum retries reached or item is not in failed state.'], 400);
        }

        $queueItem->update(['status' => 'pending']);
        dispatch(new \App\Jobs\ProcessXeroInvoice($queueItem->id));

        return response()->json(['message' => 'Invoice retry queued.']);
    }

    public function syncLog(int $companyId): JsonResponse
    {
        $logs = XeroSyncLog::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($logs);
    }

    public function syncInvoiceStatuses(int $companyId): JsonResponse
    {
        try {
            $result = $this->invoiceStatusService->syncCompanyStatuses($companyId);
            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error("Xero invoice status sync failed for company {$companyId}: {$e->getMessage()}");
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function voidInvoice(int $queueId): JsonResponse
    {
        $queueItem = XeroInvoiceQueue::find($queueId);
        if (!$queueItem) {
            return response()->json(['error' => 'Queue item not found.'], 404);
        }

        try {
            $updated = $this->invoiceStatusService->voidInvoice($queueItem);
            return response()->json($updated);
        } catch (\DomainException $e) {
            Log::warning("Xero void invoice rejected for queue {$queueId}: {$e->getMessage()}");
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            Log::error("Xero void invoice failed for queue {$queueId}: {$e->getMessage()}");
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function deleteInvoice(int $queueId): JsonResponse
    {
        $queueItem = XeroInvoiceQueue::find($queueId);
        if (!$queueItem) {
            return response()->json(['error' => 'Queue item not found.'], 404);
        }

        try {
            $updated = $this->invoiceStatusService->deleteInvoice($queueItem);
            return response()->json($updated);
        } catch (\DomainException $e) {
            Log::warning("Xero delete invoice rejected for queue {$queueId}: {$e->getMessage()}");
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            Log::error("Xero delete invoice failed for queue {$queueId}: {$e->getMessage()}");
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
