<?php

namespace App\Services;

use App\Models\XeroInvoiceQueue;
use App\Models\XeroSettings;
use App\Models\XeroSyncLog;
use App\Support\XeroDateNormalizer;
use App\Support\XeroInvoiceId;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use XeroAPI\XeroPHP\ApiException;
use XeroAPI\XeroPHP\Models\Accounting\Invoice;
use XeroAPI\XeroPHP\Models\Accounting\Invoices;

class XeroInvoiceStatusService
{
    private XeroAuthService $authService;

    public function __construct(XeroAuthService $authService)
    {
        $this->authService = $authService;
    }

    public function syncCompanyStatuses(int $companyId, int $limit = 200): array
    {
        $settings = XeroSettings::where('company_id', $companyId)->first();
        if (!$settings || !$settings->isConnected() || !$settings->xero_enabled) {
            return ['synced' => 0, 'failed' => 0, 'message' => 'Xero not connected or disabled.'];
        }

        $queueItems = XeroInvoiceQueue::where('company_id', $companyId)
            ->whereNotNull('xero_invoice_id')
            ->where('xero_invoice_id', '!=', '')
            ->where('xero_invoice_id', '!=', '00000000-0000-0000-0000-000000000000')
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get();

        if ($queueItems->isEmpty()) {
            return ['synced' => 0, 'failed' => 0, 'message' => 'No queued invoices with Xero IDs.'];
        }

        $api = $this->authService->getApiInstance($companyId);
        $tenantId = $this->authService->getTenantId($companyId);

        $synced = 0;
        $failed = 0;
        $invoiceMap = [];

        try {
            foreach ($queueItems->pluck('xero_invoice_id')->filter()->unique()->chunk(50) as $chunk) {
                [$result, , ] = $api->getInvoicesWithHttpInfo(
                    $tenantId,
                    null,
                    null,
                    null,
                    $chunk->values()->all()
                );

                foreach (($result->getInvoices() ?? []) as $invoice) {
                    $invoiceMap[$invoice->getInvoiceId()] = $invoice;
                }
            }
        } catch (\Throwable $e) {
            Log::error("Xero invoice status sync fetch failed for company {$companyId}: {$e->getMessage()}");
            XeroSyncLog::create([
                'company_id'    => $companyId,
                'sync_type'     => 'invoice',
                'direction'     => 'pull',
                'status'        => 'failed',
                'error_message' => substr($e->getMessage(), 0, 65535),
            ]);
            throw $e;
        }

        foreach ($queueItems as $queueItem) {
            try {
                $invoice = $invoiceMap[$queueItem->xero_invoice_id] ?? null;
                if (!$invoice) {
                    $queueItem->update([
                        'xero_last_status_sync_at' => now(),
                        'status_sync_error' => 'Invoice not returned by Xero.',
                    ]);
                    $failed++;
                    Log::warning("Xero status sync failed for queue item {$queueItem->id}: invoice not returned by Xero.", [
                        'company_id' => $companyId,
                        'xero_invoice_id' => $queueItem->xero_invoice_id,
                    ]);
                    continue;
                }

                $this->applyInvoiceToQueueAndHeader($queueItem, $invoice);
                $synced++;
            } catch (\Throwable $e) {
                $queueItem->update([
                    'xero_last_status_sync_at' => now(),
                    'status_sync_error' => substr($e->getMessage(), 0, 65535),
                ]);
                $failed++;
                Log::warning("Xero status sync failed for queue item {$queueItem->id}: {$e->getMessage()}", [
                    'company_id' => $companyId,
                    'xero_invoice_id' => $queueItem->xero_invoice_id,
                ]);
            }
        }

        XeroSyncLog::create([
            'company_id'     => $companyId,
            'sync_type'      => 'invoice',
            'direction'      => 'pull',
            'status'         => $failed > 0 ? 'failed' : 'success',
            'records_synced' => $synced,
            'error_message'  => $failed > 0 ? "{$failed} invoice status row(s) failed during sync." : null,
        ]);

        return ['synced' => $synced, 'failed' => $failed, 'message' => 'Invoice status sync complete.'];
    }

    public function voidInvoice(XeroInvoiceQueue $queueItem): XeroInvoiceQueue
    {
        if (!XeroInvoiceId::isUsable($queueItem->xero_invoice_id)) {
            throw new \Exception('Queue item has no Xero invoice ID.');
        }
        if (strtoupper((string) $queueItem->xero_status) !== 'AUTHORISED') {
            throw new \Exception('Only AUTHORISED invoices can be voided.');
        }

        $companyId = $queueItem->company_id;
        $api = $this->authService->getApiInstance($companyId);
        $tenantId = $this->authService->getTenantId($companyId);
        $liveInvoice = $this->fetchLiveInvoice($api, $tenantId, (string) $queueItem->xero_invoice_id);
        $this->assertInvoiceIsVoidable($liveInvoice);

        $invoice = new Invoice();
        $invoice->setInvoiceId((string) $queueItem->xero_invoice_id);
        $invoice->setStatus('VOIDED');

        $payload = new Invoices(['invoices' => [$invoice]]);
        try {
            [$response, , ] = $api->updateInvoiceWithHttpInfo($tenantId, (string) $queueItem->xero_invoice_id, $payload);
        } catch (ApiException $e) {
            $this->logXeroApiException('void', $queueItem, $e);
            throw new \DomainException($this->buildXeroValidationMessage('void', $e));
        }
        $updatedInvoice = $response->getInvoices()[0] ?? null;

        if (!$updatedInvoice) {
            throw new \Exception('Xero returned no invoice while voiding.');
        }

        $this->applyInvoiceToQueueAndHeader($queueItem->fresh(), $updatedInvoice);
        return $queueItem->fresh();
    }

    public function deleteInvoice(XeroInvoiceQueue $queueItem): XeroInvoiceQueue
    {
        if (!XeroInvoiceId::isUsable($queueItem->xero_invoice_id)) {
            throw new \Exception('Queue item has no Xero invoice ID.');
        }
        $status = strtoupper((string) $queueItem->xero_status);
        if (!in_array($status, ['DRAFT', 'SUBMITTED'], true)) {
            throw new \Exception('Only DRAFT or SUBMITTED invoices can be deleted.');
        }

        $companyId = $queueItem->company_id;
        $api = $this->authService->getApiInstance($companyId);
        $tenantId = $this->authService->getTenantId($companyId);

        $invoice = new Invoice();
        $invoice->setInvoiceId((string) $queueItem->xero_invoice_id);
        $invoice->setStatus('DELETED');

        $payload = new Invoices(['invoices' => [$invoice]]);
        try {
            [$response, , ] = $api->updateInvoiceWithHttpInfo($tenantId, (string) $queueItem->xero_invoice_id, $payload);
        } catch (ApiException $e) {
            $this->logXeroApiException('delete', $queueItem, $e);
            throw new \DomainException($this->buildXeroValidationMessage('delete', $e));
        }
        $updatedInvoice = $response->getInvoices()[0] ?? null;

        if (!$updatedInvoice) {
            throw new \Exception('Xero returned no invoice while deleting.');
        }

        $this->applyInvoiceToQueueAndHeader($queueItem->fresh(), $updatedInvoice);
        return $queueItem->fresh();
    }

    private function applyInvoiceToQueueAndHeader(XeroInvoiceQueue $queueItem, Invoice $invoice): void
    {
        $xeroStatus = $invoice->getStatus();
        $statusTimestamp = now();
        $xeroUpdatedAt = XeroDateNormalizer::toUtcDateTimeString($invoice->getUpdatedDateUTC());

        DB::transaction(function () use ($queueItem, $invoice, $xeroStatus, $statusTimestamp, $xeroUpdatedAt) {
            $queueItem->update([
                'xero_status' => $xeroStatus,
                'xero_total' => $invoice->getTotal(),
                'xero_amount_paid' => $invoice->getAmountPaid(),
                'xero_amount_due' => $invoice->getAmountDue(),
                'xero_updated_at' => $xeroUpdatedAt,
                'xero_last_status_sync_at' => $statusTimestamp,
                'status_sync_error' => null,
            ]);

            DB::update(
                "UPDATE weighingheaders
                 SET xero_invoice_status = ?, xero_invoice_status_updated_at = ?
                 WHERE id = ?",
                [$xeroStatus, $statusTimestamp, $queueItem->getRawOriginal('weighing_header_id')]
            );
        });
    }

    private function fetchLiveInvoice($api, string $tenantId, string $invoiceId): Invoice
    {
        [$result, , ] = $api->getInvoicesWithHttpInfo(
            $tenantId,
            null,
            null,
            null,
            [$invoiceId]
        );

        $invoice = $result->getInvoices()[0] ?? null;
        if (!$invoice) {
            throw new \DomainException('Invoice was not returned by Xero. Please refresh and try again.');
        }

        return $invoice;
    }

    private function assertInvoiceIsVoidable(Invoice $invoice): void
    {
        $status = strtoupper((string) $invoice->getStatus());
        if ($status !== 'AUTHORISED') {
            throw new \DomainException("Invoice cannot be voided in Xero because its current status is {$status}.");
        }

        $amountPaid = (float) ($invoice->getAmountPaid() ?? 0);
        if ($amountPaid > 0) {
            throw new \DomainException('Invoice cannot be voided in Xero because a payment has already been applied.');
        }
    }

    private function logXeroApiException(string $action, XeroInvoiceQueue $queueItem, ApiException $e): void
    {
        Log::error("Xero {$action} invoice API failure for queue {$queueItem->id}", [
            'company_id' => $queueItem->company_id,
            'xero_invoice_id' => $queueItem->xero_invoice_id,
            'http_status' => $e->getCode(),
            'response_body' => $this->apiExceptionResponseBody($e),
        ]);
    }

    private function buildXeroValidationMessage(string $action, ApiException $e): string
    {
        $body = $this->apiExceptionResponseBody($e);
        if (!$body) {
            return "Unable to {$action} invoice in Xero. Please check Xero validation rules and try again.";
        }

        $decoded = json_decode($body, true);
        if (!is_array($decoded)) {
            return "Unable to {$action} invoice in Xero. Please check Xero validation rules and try again.";
        }

        $messages = [];
        if (!empty($decoded['Message']) && is_string($decoded['Message'])) {
            $messages[] = $decoded['Message'];
        }

        foreach (($decoded['Elements'] ?? []) as $element) {
            foreach (($element['ValidationErrors'] ?? []) as $validationError) {
                if (!empty($validationError['Message']) && is_string($validationError['Message'])) {
                    $messages[] = $validationError['Message'];
                }
            }
        }

        if (empty($messages)) {
            return "Unable to {$action} invoice in Xero. Please check Xero validation rules and try again.";
        }

        return implode(' ', array_unique($messages));
    }

    private function apiExceptionResponseBody(ApiException $e): ?string
    {
        $body = $e->getResponseBody();
        if ($body === null) {
            return null;
        }

        if (is_string($body)) {
            return $body;
        }

        if (is_object($body) && method_exists($body, '__toString')) {
            return (string) $body;
        }

        $encoded = json_encode($body);
        return $encoded === false ? null : $encoded;
    }
}
