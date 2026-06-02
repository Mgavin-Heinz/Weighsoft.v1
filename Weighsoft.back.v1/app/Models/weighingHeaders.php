<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * App\Models\weighingHeaders
 *
 * @property mixed $id
 * @property string|null $transaction
 * @property int|null $settings_id
 * @property string|null $RegNumber
 * @property string|null $RegNumber2
 * @property string|null $RegNumber3
 * @property string|null $Custom1
 * @property string|null $Custom2
 * @property string|null $Custom3
 * @property string|null $Custom4
 * @property string|null $Custom5
 * @property string|null $Custom6
 * @property string|null $Custom7
 * @property string|null $Custom8
 * @property string|null $Custom9
 * @property string|null $Custom10
 * @property float|null $FirstWeight
 * @property float|null $SecondWeight
 * @property float|null $TotalWeight
 * @property int|null $NettWeight
 * @property int|null $businesspartner_id
 * @property int|null $product_id
 * @property int|null $grade_id
 * @property string|null $grades
 * @property int|null $haulier_id
 * @property int $weighbridge_id
 * @property int $site_id
 * @property int $company_id
 * @property Carbon $updated_at
 * @property Carbon $created_at
 * @property string|null $Custom11
 * @property string|null $Custom12
 * @property string|null $Custom13
 * @property string|null $Custom14
 * @property string|null $Custom15
 * @property string|null $Custom16
 * @property string|null $Custom17
 * @property string|null $Custom18
 * @property string|null $Custom19
 * @property string|null $Custom20
 * @property Carbon|null $deleted_at
 * @property string $reason
 * @property string $status
 * @property string|null $price
 * @property string|null $moisture_deduction
 * @property string|null $handling_charges
 * @property int|null $pallet_id
 * @property string|null $pallet_charges
 * @property int|null $pallet_count
 * @property int|null $tare_id
 * @property int $firstWeightUserId
 * @property int|null $secondWeightUserId
 * @property int|null $verifyUserId
 * @property int|null $deletedUserId
 * @property int $workstation_id
 * @property float|null $moisture_threshold
 * @property float|null $moistureCoefficient
 * @property float|null $moistureWeight
 * @property float|null $handlingWeight
 * @property-read ContractTransactions|null $contractTransaction
 * @method static Builder|weighingHeaders newModelQuery()
 * @method static Builder|weighingHeaders newQuery()
 * @method static \Illuminate\Database\Query\Builder|weighingHeaders onlyTrashed()
 * @method static Builder|weighingHeaders query()
 * @method static Builder|weighingHeaders whereBusinesspartnerId($value)
 * @method static Builder|weighingHeaders whereCompanyId($value)
 * @method static Builder|weighingHeaders whereCreatedAt($value)
 * @method static Builder|weighingHeaders whereCustom1($value)
 * @method static Builder|weighingHeaders whereCustom10($value)
 * @method static Builder|weighingHeaders whereCustom11($value)
 * @method static Builder|weighingHeaders whereCustom12($value)
 * @method static Builder|weighingHeaders whereCustom13($value)
 * @method static Builder|weighingHeaders whereCustom14($value)
 * @method static Builder|weighingHeaders whereCustom15($value)
 * @method static Builder|weighingHeaders whereCustom16($value)
 * @method static Builder|weighingHeaders whereCustom17($value)
 * @method static Builder|weighingHeaders whereCustom18($value)
 * @method static Builder|weighingHeaders whereCustom19($value)
 * @method static Builder|weighingHeaders whereCustom2($value)
 * @method static Builder|weighingHeaders whereCustom20($value)
 * @method static Builder|weighingHeaders whereCustom3($value)
 * @method static Builder|weighingHeaders whereCustom4($value)
 * @method static Builder|weighingHeaders whereCustom5($value)
 * @method static Builder|weighingHeaders whereCustom6($value)
 * @method static Builder|weighingHeaders whereCustom7($value)
 * @method static Builder|weighingHeaders whereCustom8($value)
 * @method static Builder|weighingHeaders whereCustom9($value)
 * @method static Builder|weighingHeaders whereDeletedAt($value)
 * @method static Builder|weighingHeaders whereDeletedUserId($value)
 * @method static Builder|weighingHeaders whereFirstWeight($value)
 * @method static Builder|weighingHeaders whereFirstWeightUserId($value)
 * @method static Builder|weighingHeaders whereGradeId($value)
 * @method static Builder|weighingHeaders whereGrades($value)
 * @method static Builder|weighingHeaders whereHandlingCharges($value)
 * @method static Builder|weighingHeaders whereHaulierId($value)
 * @method static Builder|weighingHeaders whereId($value)
 * @method static Builder|weighingHeaders whereMoistureDeduction($value)
 * @method static Builder|weighingHeaders whereNettWeight($value)
 * @method static Builder|weighingHeaders wherePalletCharges($value)
 * @method static Builder|weighingHeaders wherePalletCount($value)
 * @method static Builder|weighingHeaders wherePalletId($value)
 * @method static Builder|weighingHeaders wherePrice($value)
 * @method static Builder|weighingHeaders whereProductId($value)
 * @method static Builder|weighingHeaders whereReason($value)
 * @method static Builder|weighingHeaders whereRegNumber($value)
 * @method static Builder|weighingHeaders whereRegNumber2($value)
 * @method static Builder|weighingHeaders whereRegNumber3($value)
 * @method static Builder|weighingHeaders whereSecondWeight($value)
 * @method static Builder|weighingHeaders whereSecondWeightUserId($value)
 * @method static Builder|weighingHeaders whereSettingsId($value)
 * @method static Builder|weighingHeaders whereSiteId($value)
 * @method static Builder|weighingHeaders whereStatus($value)
 * @method static Builder|weighingHeaders whereTareId($value)
 * @method static Builder|weighingHeaders whereTotalWeight($value)
 * @method static Builder|weighingHeaders whereTransaction($value)
 * @method static Builder|weighingHeaders whereUpdatedAt($value)
 * @method static Builder|weighingHeaders whereVerifyUserId($value)
 * @method static Builder|weighingHeaders whereWeighbridgeId($value)
 * @method static Builder|weighingHeaders whereWorkstationId($value)
 * @method static \Illuminate\Database\Query\Builder|weighingHeaders withTrashed()
 * @method static \Illuminate\Database\Query\Builder|weighingHeaders withoutTrashed()
 * @mixin \Eloquent
 */
class weighingHeaders extends Model
{
    use SoftDeletes;

    protected $table = 'weighingheaders';
    protected $keyType = "string";
    public $incrementing = false;
    protected $fillable = [
        'transaction',
        'settings_id',
        'RegNumber',
        'RegNumber2',
        'RegNumber3',
        'Custom1',
        'Custom2',
        'Custom3',
        'Custom4',
        'Custom5',
        'Custom6',
        'Custom7',
        'Custom8',
        'Custom9',
        'Custom10',
        'Custom11',
        'Custom12',
        'Custom13',
        'Custom14',
        'Custom15',
        'Custom16',
        'Custom17',
        'Custom18',
        'Custom19',
        'Custom20',
        'FirstWeight',
        'SecondWeight',
        'TotalWeight',
        'NettWeight',
        'businesspartner_id',
        'product_id',
        'pallet_id',
        'grade_id',
        'grades',
        'tare_id',
        'pallet_count',
        'pallet_charges',
        'haulier_id',
        'weighbridge_id',
        'site_id',
        'company_id',
        'deleted_at',
        'reason',
        'status',
        'xero_invoice_id',
        'xero_invoice_status',
        'xero_invoice_status_updated_at',
        'invoice_modified',
        'price',
        'moisture_deduction',
        'handling_charges',
        'firstWeightUserId',
        'secondWeightUserId',
        'verifyUserId',
        'deletedUserId',
        'workstation_id',
        'moisture_threshold',
        'moistureCoefficient',
        'moistureWeight',
        'handlingWeight',
        'stockpile_nr',
        'destination',
        'order_numbers',
        'contract_packaging_price_per_ton',
        'contract_shipping_price_per_ton'
    ];


    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format("Y-m-d H:i:s");
    }

    public function contractTransaction(): HasOne
    {
        return $this->hasOne('App\Models\ContractTransactions', 'weighing_header_id');
    }
}
