<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class XeroSettings extends Model
{
    protected $table = 'xero_settings';

    protected $fillable = [
        'company_id',
        'xero_tenant_id',
        'organization_name',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'xero_enabled',
        'sync_customers',
        'sync_products',
        'auto_create_invoices',
        'invoice_action',
        'sync_frequency_minutes',
        'currency_code',
        'last_customer_sync_at',
        'last_product_sync_at',
        'packaging_product_id',
        'shipping_product_id',
    ];

    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    public const SYNC_OFF = 'off';
    public const SYNC_XERO_TO_WEIGHSOFT = 'xero_to_weighsoft';
    /** Full mirror: archive/inactive → soft-delete, orphan reconcile, restore, local-only prune. */
    public const SYNC_STRICT_XERO_TO_WEIGHSOFT = 'strict_xero_to_weighsoft';
    public const SYNC_WEIGHSOFT_TO_XERO = 'weighsoft_to_xero';
    public const SYNC_BIDIRECTIONAL = 'bidirectional';

    protected $casts = [
        'xero_enabled' => 'boolean',
        'auto_create_invoices' => 'boolean',
        'sync_frequency_minutes' => 'integer',
        'token_expires_at' => 'datetime',
        'last_customer_sync_at' => 'datetime',
        'last_product_sync_at' => 'datetime',
        'packaging_product_id' => 'integer',
        'shipping_product_id' => 'integer',
    ];

    public function shouldPullCustomers(): bool
    {
        return in_array($this->sync_customers, [
            self::SYNC_XERO_TO_WEIGHSOFT,
            self::SYNC_STRICT_XERO_TO_WEIGHSOFT,
            self::SYNC_BIDIRECTIONAL,
        ], true);
    }

    public function shouldPushCustomers(): bool
    {
        return in_array($this->sync_customers, [self::SYNC_WEIGHSOFT_TO_XERO, self::SYNC_BIDIRECTIONAL]);
    }

    public function shouldPullProducts(): bool
    {
        return in_array($this->sync_products, [
            self::SYNC_XERO_TO_WEIGHSOFT,
            self::SYNC_STRICT_XERO_TO_WEIGHSOFT,
            self::SYNC_BIDIRECTIONAL,
        ], true);
    }

    public function strictMirrorCustomers(): bool
    {
        return $this->sync_customers === self::SYNC_STRICT_XERO_TO_WEIGHSOFT;
    }

    public function strictMirrorProducts(): bool
    {
        return $this->sync_products === self::SYNC_STRICT_XERO_TO_WEIGHSOFT;
    }

    public function shouldPushProducts(): bool
    {
        return in_array($this->sync_products, [self::SYNC_WEIGHSOFT_TO_XERO, self::SYNC_BIDIRECTIONAL]);
    }

    /**
     * Allowed values: off, xero_to_weighsoft, strict_xero_to_weighsoft.
     * Legacy bidirectional / push-only strings normalize to standard pull (not strict).
     */
    public static function normalizedSyncDirection(?string $value): string
    {
        if ($value === self::SYNC_OFF) {
            return self::SYNC_OFF;
        }
        if ($value === self::SYNC_STRICT_XERO_TO_WEIGHSOFT) {
            return self::SYNC_STRICT_XERO_TO_WEIGHSOFT;
        }

        return self::SYNC_XERO_TO_WEIGHSOFT;
    }

    public function isSyncEnabled(string $type): bool
    {
        $value = $type === 'customers' ? $this->sync_customers : $this->sync_products;
        return $value !== self::SYNC_OFF;
    }

    protected $appends = ['connected'];

    public function setAccessTokenAttribute($value)
    {
        $this->attributes['access_token'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getAccessTokenAttribute($value)
    {
        if (!$value) {
            return null;
        }
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function setRefreshTokenAttribute($value)
    {
        $this->attributes['refresh_token'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getRefreshTokenAttribute($value)
    {
        if (!$value) {
            return null;
        }
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getConnectedAttribute(): bool
    {
        return $this->isConnected();
    }

    public function isConnected(): bool
    {
        return !empty($this->attributes['access_token'])
            && !empty($this->attributes['refresh_token'])
            && !empty($this->xero_tenant_id);
    }

    public function isTokenExpired(): bool
    {
        if (!$this->token_expires_at) {
            return true;
        }
        return $this->token_expires_at->isPast();
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
