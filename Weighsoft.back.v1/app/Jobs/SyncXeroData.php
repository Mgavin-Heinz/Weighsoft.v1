<?php

namespace App\Jobs;

use App\Models\XeroSettings;
use App\Services\XeroSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncXeroData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 600;

    public function handle(XeroSyncService $syncService): void
    {
        $companies = XeroSettings::where('xero_enabled', true)
            ->whereNotNull('xero_tenant_id')
            ->get();

        foreach ($companies as $settings) {
            try {
                $syncService->syncAll($settings->company_id);
                Log::info("Xero sync completed for company {$settings->company_id}");
            } catch (\Exception $e) {
                Log::error("Xero sync failed for company {$settings->company_id}: {$e->getMessage()}");
            }
        }
    }
}
