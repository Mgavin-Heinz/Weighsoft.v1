<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App\Models\Tare
 *
 * @property int $id
 * @property string $registration_no
 * @property string $weight
 * @property int $company_id
 * @property int $site_id
 * @property string $expiry_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property int $weighbridge_id
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\Site $site
 * @method static \Illuminate\Database\Eloquent\Builder|Tare newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Tare newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Tare query()
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereExpiryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereRegistrationNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereWeighbridgeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Tare whereWeight($value)
 * @mixin \Eloquent
 */

/**
 * @OA\Schema(
 *     title="Tare model",
 *     description="Tare model",
 *     @OA\Xml(
 *         name="Tare"
 *     )
 * )
 */
class Tare extends Model
{

    protected $table = 'tares';

    protected $guarded = [];

    protected $fillable = ["id", "registration_no", "weight", "company_id", "site_id", "expiry_date", "created_at", "updated_at", "weighbridge_id"];

    public function company(): BelongsTo
    {
        return $this->belongsTo('App\Models\Company');
    }


    public function site(): BelongsTo
    {
        return $this->belongsTo('App\Models\Site');
    }
}
