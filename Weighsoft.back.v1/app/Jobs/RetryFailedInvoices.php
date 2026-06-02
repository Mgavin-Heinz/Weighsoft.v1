<?php

namespace App\Jobs;

use App\Models\XeroSettings;
use App\Services\XeroInvoiceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RetryFailedInvoices implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 300;

    public function handle(XeroInvoiceService $invoiceService): void
    {
        $companies = XeroSettings::where('xero_enabled', true)
            ->whereNotNull('xero_tenant_id')
            ->get();

        foreach ($companies as $settings) {
            try {
                $retried = $invoiceService->retryFailed($settings->company_id);
                if ($retried > 0) {
                    Log::info("Retried {$retried} failed Xero invoices for company {$settings->company_id}");
                }
            } catch (\Exception $e) {
                Log::error("Invoice retry failed for company {$settings->company_id}: {$e->getMessage()}");
            }
        }
    }
}
