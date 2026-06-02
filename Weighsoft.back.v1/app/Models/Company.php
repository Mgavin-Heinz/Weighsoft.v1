<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Company
 *
 * @property int $id
 * @property string $code
 * @property string $registered_name
 * @property string $tel
 * @property string $fax
 * @property string $email
 * @property string $registration_number
 * @property string $vat_nr
 * @property string $contact_person
 * @property string $cell
 * @property string $street
 * @property string $suburb1
 * @property string $city1
 * @property string $postal_code1
 * @property string $po_box
 * @property string $suburb2
 * @property string $city2
 * @property string $postal_code2
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property string|null $terms
 * @property string|null $display_custom_logo_img
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Camera[] $cameras
 * @property-read int|null $cameras_count
 * @method static \Illuminate\Database\Eloquent\Builder|Company newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Company newQuery()
 * @method static \Illuminate\Database\Query\Builder|Company onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Company query()
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereCell($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereCity1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereCity2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereContactPerson($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereDeleteTransactionFlag($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereFax($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company wherePoBox($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company wherePostalCode1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company wherePostalCode2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereRegisteredName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereRegistrationNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereStreet($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereSuburb1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereSuburb2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereTel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereTerms($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereDisplayCustomLogoImg($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Company whereVatNr($value)
 * @method static \Illuminate\Database\Query\Builder|Company withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Company withoutTrashed()
 * @mixin \Eloquent
 */
class Company extends Model
{
    use SoftDeletes;

    protected $table = 'companies';
    protected $fillable = ['code', 'registered_name', 'tel', 'fax', 'email', 'registration_number', 'vat_nr', 'terms', 'contact_person', 'cell', 'street', 'suburb1', 'city1', 'postal_code1', 'po_box', 'suburb2', 'city2', 'postal_code2', 'display_custom_logo_img', 'smart_hauliers'];

    public function cameras(): HasMany
    {
        return $this->hasMany('App\Models\Camera');
    }
}
