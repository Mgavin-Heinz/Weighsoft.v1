<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\weighingCameras
 *
 * @property int $id
 * @property string $base64
 * @property string $isnpr
 * @property int $weighing_transaction_id
 * @property int $site_id
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property string|null $deleted_at
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras query()
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereBase64($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereIsnpr($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingCameras whereWeighingTransactionId($value)
 * @mixin \Eloquent
 */
class weighingCameras extends Model
{
    protected $table = 'weighingcameras';
    protected $fillable = ['base64', 'isnpr', 'weighing_transaction_id', 'site_id', 'company_id'];
}
