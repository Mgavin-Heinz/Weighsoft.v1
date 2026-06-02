<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\weighingTransactions
 *
 * @property mixed $id
 * @property string $Status
 * @property string $Weight1
 * @property string $Weight2
 * @property string $Weight3
 * @property string $Weight4
 * @property string $Weight5
 * @property string $Weight6
 * @property string $WeightTotal
 * @property mixed|null $weighing_header_id
 * @property int $site_id
 * @property int|null $workstation_id
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property string|null $deleted_at
 * @property int|null $AxelSetups
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions query()
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereAxelSetups($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWeighingHeaderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWeight1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWeight2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWeight3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWeight4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWeight5($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWeight6($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWeightTotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|weighingTransactions whereWorkstationId($value)
 * @mixin \Eloquent
 */
class weighingTransactions extends Model
{
    protected $table = 'weighingtransactions';
    protected $keyType = 'string';
    protected $fillable = ['comment', 'Status', 'Weight1', 'Weight2', 'Weight3', 'Weight4', 'Weight5', 'Weight6',
        'WeightTotal', 'AxelSetups', 'workstation_id',
        'weighing_header_id', 'user_id', 'user_name', 'site_id', 'company_id'];

    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format("Y-m-d H:i:s");
    }
}
