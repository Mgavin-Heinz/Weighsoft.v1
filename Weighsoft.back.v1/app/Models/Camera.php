<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Camera
 *
 * @property int $id
 * @property string $name
 * @property string $pn_recog
 * @property string $ip_address
 * @property string $camera_active
 * @property int $weighbridge_id
 * @property int $workstation_id
 * @property int $site_id
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\Site $site
 * @method static \Illuminate\Database\Eloquent\Builder|Camera newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Camera newQuery()
 * @method static \Illuminate\Database\Query\Builder|Camera onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Camera query()
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereCameraActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera wherePnRecog($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereWeighbridgeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Camera whereWorkstationId($value)
 * @method static \Illuminate\Database\Query\Builder|Camera withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Camera withoutTrashed()
 * @mixin \Eloquent
 */
/**
 * @OA\Schema(
 *     title="Camera",
 *     description="Camera model",
 *     @OA\Xml(
 *         name="Camera"
 *     )
 * )
 */
class Camera extends Model
{
    use SoftDeletes;

    protected $table = 'cameras';
    
    protected $fillable = [
        'name', 
        'pn_recog', 
        'ip_address', 
        'camera_active', 
        'print_camera',
        'weighbridge_id', 
        'workstation_id', 
        'site_id', 
        'company_id',
        'auth_type',
        'username',
        'password'
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo('App\Models\Company');
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo('App\Models\Site');
    }
}
