<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\WorkStations
 *
 * @property int $id
 * @property string $workstation_type
 * @property string $workstation_name
 * @property string $workstation_active
 * @property int $site_id
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations newQuery()
 * @method static \Illuminate\Database\Query\Builder|WorkStations onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations query()
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereWorkstationActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereWorkstationName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WorkStations whereWorkstationType($value)
 * @method static \Illuminate\Database\Query\Builder|WorkStations withTrashed()
 * @method static \Illuminate\Database\Query\Builder|WorkStations withoutTrashed()
 * @mixin \Eloquent
 */
class WorkStations extends Model
{
    use SoftDeletes;

    protected $table = 'workstations';
    protected $fillable = [
        'workstation_type',
        'workstation_name',
        'workstation_active',
        'scale_endpoint',
        'site_id',
        'company_id',
        'incoming_boom_ip',
        'exiting_boom_ip',
        'incoming_boom_relay',
        'exiting_boom_relay',
        'incoming_red_light_ip',
        'incoming_red_light_relay',
        'incoming_green_light_ip',
        'incoming_green_light_relay',
        'exiting_red_light_ip',
        'exiting_red_light_relay',
        'exiting_green_light_ip',
        'exiting_green_light_relay'
    ];
}
