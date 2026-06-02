<?php

namespace App\Models;

use Barryvdh\LaravelIdeHelper\Eloquent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * App\Models\AxelTypes
 *
 * @property int $id
 * @property int $Single_Steering
 * @property int $Double_Steering
 * @property int $Triple_Steering
 * @property int $Single_Non_Steering
 * @property int $Double_Non_Steering
 * @property int $Triple_Non_Steering
 * @property int $Double_Single_Non_Steering
 * @property int $Double_Double_Non_Steering
 * @property int $Double_Triple_Non_Steering
 * @property int $company_id
 * @property Carbon $updated_at
 * @property Carbon $created_at
 * @property string|null $deleted_at
 * @property int $Custom_1
 * @property int $Custom_2
 * @property int $Custom_3
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes query()
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereCustom1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereCustom2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereCustom3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereDoubleDoubleNonSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereDoubleNonSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereDoubleSingleNonSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereDoubleSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereDoubleTripleNonSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereSingleNonSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereSingleSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereTripleNonSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereTripleSteering($value)
 * @method static \Illuminate\Database\Eloquent\Builder|AxelTypes whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class AxelTypes extends Model
{
    use HasFactory;
    protected $table = 'axletypes';
    protected $fillable = ['Single_Steering','Double_Steering','Triple_Steering',
        'Single_Non_Steering','Double_Non_Steering','Triple_Non_Steering',
        'Double_Single_Non_Steering','Double_Double_Non_Steering','Double_Triple_Non_Steering','Custom_1',
        'Custom_2','Custom_3','company_id'];
}
