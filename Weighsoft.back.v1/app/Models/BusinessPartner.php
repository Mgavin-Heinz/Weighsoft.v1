<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\BusinessPartner
 *
 * @property int $id
 * @property string $code
 * @property string $name
 * @property int $site_id
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property string|null $vat_nr
 * @property string|null $street
 * @property string|null $suburb
 * @property string|null $city
 * @property string|null $postal_code
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner newQuery()
 * @method static \Illuminate\Database\Query\Builder|BusinessPartner onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner query()
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner wherePostalCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereStreet($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereSuburb($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|BusinessPartner whereVatNr($value)
 * @method static \Illuminate\Database\Query\Builder|BusinessPartner withTrashed()
 * @method static \Illuminate\Database\Query\Builder|BusinessPartner withoutTrashed()
 * @mixin \Eloquent
 */
class BusinessPartner extends Model
{
    use SoftDeletes;

    protected $dates = ['deleted_at'];
    protected $table = 'businesspartners';
    protected $fillable = ['code', 'name', 'vat_nr', 'xero_contact_id', 'xero_synced_at', 'street', 'suburb', 'city', 'postal_code', 'site_id', 'company_id'];

    /**
     * Get all hauliers linked to this business partner (Smart Hauliers feature)
     */
    public function hauliers()
    {
        return $this->hasMany(Haulier::class, 'business_partner_id', 'id');
    }

    /**
     * Get the company this business partner belongs to
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
