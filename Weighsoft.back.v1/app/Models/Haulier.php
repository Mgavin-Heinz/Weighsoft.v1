<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Haulier
 *
 * @property int $id
 * @property string $code
 * @property string $name
 * @property int $site_id
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier newQuery()
 * @method static \Illuminate\Database\Query\Builder|Haulier onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier query()
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Haulier whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|Haulier withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Haulier withoutTrashed()
 * @mixin \Eloquent
 */
class Haulier extends Model
{
    use SoftDeletes;

    protected $table = 'hauliers';
    protected $fillable = ['code', 'name', 'company_id', 'site_id', 'business_partner_id'];

    /**
     * Get the business partner for invoicing.
     */
    public function businessPartner(): BelongsTo
    {
        return $this->belongsTo(BusinessPartner::class);
    }

    /**
     * Get the vehicles for this haulier (Smart Hauliers feature).
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(RFIDVehicle::class, 'haulier_id', 'id');
    }
}
