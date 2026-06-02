<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Reporting
 *
 * @property int $id
 * @property string|null $name
 * @property string|null $description
 * @property string|null $jsondata
 * @property string|null $company_id
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property string|null $show_deleted
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting newQuery()
 * @method static \Illuminate\Database\Query\Builder|Reporting onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting query()
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereJsondata($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|Reporting withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Reporting withoutTrashed()
 * @mixin \Eloquent
 * @property string|null $email
 * @property string|null $schedule
 * @property string|null $last_report_on
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereLastReportOn($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Reporting whereSchedule($value)
 */
class Reporting extends Model
{
    use SoftDeletes;
    protected $table = 'reporting';
    protected $fillable = ['name', 'description', 'jsondata', 'company_id', 'email', 'schedule', 'last_report_on', 'time_frame', 'show_deleted'];
    protected $dates = ['created_at', 'updated_at', 'deleted_at'];

    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format("Y-m-d H:i:s");
    }
}
