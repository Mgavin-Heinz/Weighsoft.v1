<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class XeroSyncLog extends Model
{
    protected $table = 'xero_sync_log';

    public $timestamps = false;

    protected $fillable = [
        'company_id',
        'sync_type',
        'direction',
        'status',
        'records_synced',
        'error_message',
    ];

    protected $casts = [
        'records_synced' => 'integer',
        'created_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
