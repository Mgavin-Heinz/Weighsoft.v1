<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\Site
 *
 * @property int $id
 * @property string $site_type
 * @property string $site_name
 * @property string|null $finger_active
 * @property string|null $override_silo
 * @property string $site_active
 * @property mixed $custom_header_text
 * @property mixed $custom_footer_text
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Camera[] $cameras
 * @property-read int|null $cameras_count
 * @method static \Illuminate\Database\Eloquent\Builder|Site newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Site newQuery()
 * @method static \Illuminate\Database\Query\Builder|Site onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|Site query()
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereCustomFooterText($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereCustomHeaderText($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereFingerActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereOverrideSilo($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereSiteActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereSiteName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereSiteType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Site whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|Site withTrashed()
 * @method static \Illuminate\Database\Query\Builder|Site withoutTrashed()
 * @mixin \Eloquent
 */
class Site extends Model
{
    use SoftDeletes;

    protected $table = 'sites';
    protected $fillable = ['site_type', 'site_name', 'email', 'site_active', 'override_silo', 'shared_workstation', 'finger_active', 'custom_header_text', 'custom_footer_text', 'company_id','measure_type','deduct_flow', 'decimals'];

    public function cameras(): HasMany
    {
        return $this->hasMany('App\Models\Camera');
    }
}
