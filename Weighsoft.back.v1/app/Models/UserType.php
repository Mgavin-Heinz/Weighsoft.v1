<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\UserType
 *
 * @property int $id
 * @property string $usertypes
 * @property string|null $level
 * @property string $companies
 * @property string $sites
 * @property string $workstations
 * @property string|null $weighbridges
 * @property string $cameras
 * @property string|null $weigh_types
 * @property string $weighing
 * @property string $verify
 * @property string $reprint
 * @property string $business_partner
 * @property string $products
 * @property string $hauliers
 * @property string|null $stored_tares
 * @property string|null $rfid_vehicle
 * @property string|null $axel_types
 * @property string|null $axel_settings
 * @property string|null $transaction_report
 * @property string|null $exception_report
 * @property string|null $users
 * @property string|null $user_types
 * @property string $delete_transaction_flag
 * @property string|null $xero
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|UserType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|UserType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|UserType query()
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereAxelSettings($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereAxelTypes($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereBusinessPartner($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereCameras($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereCompanies($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereExceptionReport($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereHauliers($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereProducts($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereReprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereRfidVehicle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereSites($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereStoredTares($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereTransactionReport($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereUsers($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereUsertypes($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereVerify($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereWeighTypes($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereWeighbridges($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereWeighing($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserType whereWorkstations($value)
 * @mixin \Eloquent
 */
class UserType extends Model
{
    protected $table = 'usertypes';
    protected $fillable = ['usertypes', 'level', 'companies', 'sites', 'workstations', 'weighbridges', 'cameras', 'weigh_types', 'weighing',
        'verify', 'reprint', 'business_partner', 'products', 'hauliers', 'stored_tares', 'rfid_vehicle',
        'axel_types', 'axel_settings', 'transaction_report', 'exception_report', 'users', 'user_types', 'delete_transaction_flag', 'xero'];
}
