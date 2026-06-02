<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * App\Models\RFIDVehicle
 *
 * @property int $id
 * @property string $registration_number
 * @property string $rfid
 * @property int|null $haulier_id
 * @property int $company_id
 * @property int|null $site_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property-read \App\Models\Haulier|null $haulier
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\Site|null $site
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle query()
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle whereHaulierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle whereRegistrationNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle whereRfid($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RFIDVehicle whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class RFIDVehicle extends Model
{
    protected $table = 'rfid_vehicles';
    public $fillable = ['registration_number', 'rfid', 'haulier_id', 'company_id', 'site_id'];

    /**
     * Get the haulier that owns the vehicle.
     */
    public function haulier(): BelongsTo
    {
        return $this->belongsTo(Haulier::class);
    }

    /**
     * Get the company that owns the vehicle.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the site for the vehicle.
     */
    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }
}

