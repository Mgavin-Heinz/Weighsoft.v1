<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App\Models\Pallet
 *
 * @property int $pallet_id
 * @property string $pallet_name
 * @property string $amount
 * @property int $company_id
 * @property int $site_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\Site $site
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet query()
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet wherePalletId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet wherePalletName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Pallet whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Pallet extends Model
{
    protected $table = 'pallets';
    protected $guarded = [];
    protected $primaryKey = 'pallet_id';
    protected $fillable = ["pallet_id", "pallet_name", "amount", "company_id", "site_id", "created_at", "updated_at"];

    public function company(): BelongsTo
    {
        return $this->belongsTo('App\Models\Company');
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo('App\Models\Site');
    }
}
