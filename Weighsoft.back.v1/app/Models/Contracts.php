<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Contracts
 *
 * @property int $id
 * @property string $name
 * @property int $businesspartner_id
 * @property string $expiry_date
 * @property string $direction
 * @property string|null $price
 * @property string $amount
 * @property int $product_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property int $company_id
 * @property int $site_id
 * @property string|null $reason
 * @property int|null $linked_contact_id
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\Site $site
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\ContractTransactions[] $transactions
 * @property-read int|null $transactions_count
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts newQuery()
 * @method static \Illuminate\Database\Query\Builder|Contracts onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts query()
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereBusinesspartnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereDirection($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereExpiryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereLinkedContactId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Contracts whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|Contracts withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Contracts withoutTrashed()
 * @mixin \Eloquent
 */
class Contracts extends Model
{
    use SoftDeletes;

    protected $table = 'contracts';
    protected $fillable = ['name', 'businesspartner_id', 'expiry_date', 'direction', 'price',
        'amount', 'product_id', 'site_id', 'company_id', 'reason', 'linked_contact_id', 'stockpile_nr', 'destination', 'order_numbers',
        'packaging_enabled', 'packaging_price_per_ton', 'shipping_enabled', 'shipping_price_per_ton'];

    public function company(): BelongsTo
    {
        return $this->belongsTo('App\Models\Company');
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo('App\Models\Site');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(ContractTransactions::class,'contract_id');
    }
}
