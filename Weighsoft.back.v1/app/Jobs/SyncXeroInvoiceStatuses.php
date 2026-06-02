<?php

namespace App\Jobs;

use App\Models\XeroSettings;
use App\Services\XeroInvoiceStatusService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncXeroInvoiceStatuses implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 600;

    public function handle(XeroInvoiceStatusService $statusService): void
    {
        $companies = XeroSettings::where('xero_enabled', true)
            ->whereNotNull('xero_tenant_id')
            ->get();

        foreach ($companies as $settings) {
            try {
                $result = $statusService->syncCompanyStatuses($settings->company_id);
                Log::info("Xero invoice status sync completed for company {$settings->company_id}.", $result);
            } catch (\Throwable $e) {
                Log::error("Xero invoice status sync failed for company {$settings->company_id}: {$e->getMessage()}");
            }
        }
    }
}
