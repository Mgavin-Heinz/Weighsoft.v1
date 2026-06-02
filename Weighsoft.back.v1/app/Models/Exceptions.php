<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\Exceptions
 *
 * @property int $id
 * @property string $code
 * @property string $description
 * @property string $jsondata
 * @property string $comment
 * @property int $weighbridge_id
 * @property int $workstation_id
 * @property int $site_id
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions query()
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereJsondata($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereWeighbridgeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Exceptions whereWorkstationId($value)
 * @mixin \Eloquent
 */
class Exceptions extends Model
{
    protected $table = 'exceptions';
    protected $fillable = [ 'code', 'description', 'jsondata', 'comment', 'weighbridge_id', 'workstation_id', 'site_id', 'company_id'];
}
