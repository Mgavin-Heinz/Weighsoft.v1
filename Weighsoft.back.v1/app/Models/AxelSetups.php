<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\AxelSetups
 *
 * @property int $id
 * @property string $name
 * @property string $steering
 * @property int $steering_max
 * @property string $axel_1
 * @property int $axel_1_max
 * @property string $axel_2
 * @property int $axel_2_max
 * @property string $axel_3
 * @property int $axel_3_max
 * @property string $axel_4
 * @property int $axel_4_max
 * @property int $vehicle_max
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups newQuery()
 * @method static \Illuminate\Database\Query\Builder|AxelSetups onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups query()
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereAxel1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereAxel1Max($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereAxel2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereAxel2Max($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereAxel3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereAxel3Max($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereAxel4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereAxel4Max($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereSteeringMax($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelSetups whereVehicleMax($value)
 * @method static \Illuminate\Database\Query\Builder|AxelSetups withTrashed()
 * @method static \Illuminate\Database\Query\Builder|AxelSetups withoutTrashed()
 * @mixin \Eloquent
 */
class AxelSetups extends Model
{
    use SoftDeletes;
    protected $table = 'axelsetups';
    protected $fillable = ['name', 'steering', 'steering_max', 'axel_1', 'axel_1_max', 'axel_2', 'axel_2_max', 'axel_3', 'axel_3_max', 'axel_4', 'axel_4_max', 'vehicle_max', 'company_id'];
}
