<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Weighbridge
 *
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string $port_num
 * @property string $display_port_num
 * @property string $scale
 * @property string $decimal_places
 * @property string $stable_samples
 * @property string $manual
 * @property string $in_reverse
 * @property float $weight
 * @property int $workstation_id
 * @property int $site_id
 * @property int $company_id
 * @property string $weighing_transaction_flag
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge newQuery()
 * @method static \Illuminate\Database\Query\Builder|Weighbridge onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge query()
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereScale($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereDecimalPlaces($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereInReverse($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereManual($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge wherePortNum($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereDisplayPortNum($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereStableSamples($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereWeighingTransactionFlag($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereWeight($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Weighbridge whereWorkstationId($value)
 * @method static \Illuminate\Database\Query\Builder|Weighbridge withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Weighbridge withoutTrashed()
 * @mixin \Eloquent
 */
class Weighbridge extends Model
{
    use SoftDeletes;

    protected $table = 'weighbridges';
    protected $fillable = [
        'name', 
        'code', 
        'port_num', 
        'display_port_num', 
        'scale', 
        'decimal_places',
        'stable_samples', 
        'in_reverse', 
        'manual', 
        'weight', 
        'workstation_id', 
        'site_id', 
        'company_id', 
        'weighing_transaction_flag'
    ];
}
