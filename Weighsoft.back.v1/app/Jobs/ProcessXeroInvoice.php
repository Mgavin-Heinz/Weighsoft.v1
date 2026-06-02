<?php

namespace App\Jobs;

use App\Models\XeroInvoiceQueue;
use App\Services\XeroInvoiceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessXeroInvoice implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    private int $queueItemId;

    public function __construct(int $queueItemId)
    {
        $this->queueItemId = $queueItemId;
    }

    public function handle(XeroInvoiceService $invoiceService): void
    {
        $queueItem = XeroInvoiceQueue::find($this->queueItemId);

        if (!$queueItem) {
            Log::warning("ProcessXeroInvoice: queue item {$this->queueItemId} not found.");
            return;
        }

        if (!$queueItem->isPending() && $queueItem->status !== 'failed') {
            return;
        }

        $invoiceService->processInvoice($queueItem);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessXeroInvoice job failed for queue item {$this->queueItemId}: {$exception->getMessage()}");

        $queueItem = XeroInvoiceQueue::find($this->queueItemId);
        if ($queueItem) {
            $queueItem->update([
                'status'        => 'failed',
                'error_message' => substr($exception->getMessage(), 0, 65535),
                'retry_count'   => $queueItem->retry_count + 1,
                'last_retry_at' => now(),
            ]);
        }
    }
}
