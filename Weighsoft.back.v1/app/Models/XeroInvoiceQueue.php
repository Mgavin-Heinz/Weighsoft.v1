<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class XeroInvoiceQueue extends Model
{
    protected $table = 'xero_invoice_queue';

    protected $hidden = [
        'weighing_header_id',
    ];

    protected $appends = [
        'weighing_header_uuid',
    ];

    protected $fillable = [
        'weighing_header_id',
        'company_id',
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
    ];

    protected $casts = [
        'net_weight' => 'decimal:2',
        'xero_total' => 'decimal:2',
        'xero_amount_paid' => 'decimal:2',
        'xero_amount_due' => 'decimal:2',
        'xero_updated_at' => 'datetime',
        'xero_last_status_sync_at' => 'datetime',
        'retry_count' => 'integer',
        'max_retries' => 'integer',
        'last_retry_at' => 'datetime',
    ];

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function canRetry(): bool
    {
        return $this->status === 'failed' && $this->retry_count < $this->max_retries;
    }

    public function getWeighingHeaderUuidAttribute(): ?string
    {
        $binaryUuid = $this->attributes['weighing_header_id'] ?? null;

        if (!is_string($binaryUuid) || strlen($binaryUuid) !== 16) {
            return null;
        }

        $orderedHex = bin2hex($binaryUuid);
        $canonicalHex = substr($orderedHex, 8, 8)
            . substr($orderedHex, 4, 4)
            . substr($orderedHex, 0, 4)
            . substr($orderedHex, 16, 16);

        return sprintf(
            '%s-%s-%s-%s-%s',
            substr($canonicalHex, 0, 8),
            substr($canonicalHex, 8, 4),
            substr($canonicalHex, 12, 4),
            substr($canonicalHex, 16, 4),
            substr($canonicalHex, 20, 12)
        );
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
