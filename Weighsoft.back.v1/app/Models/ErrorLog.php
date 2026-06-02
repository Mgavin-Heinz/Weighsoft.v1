<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\ErrorLog
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
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog query()
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereComment($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereJsondata($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereWeighbridgeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ErrorLog whereWorkstationId($value)
 * @mixin \Eloquent
 */
class ErrorLog extends Model
{
    protected $table = 'errorlog';
    protected $fillable = [ 'code', 'description', 'jsondata', 'comment', 'weighbridge_id', 'workstation_id', 'site_id', 'company_id'];
}
