<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\user_workstation
 *
 * @method static \Illuminate\Database\Eloquent\Builder|user_workstation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|user_workstation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|user_workstation query()
 * @mixin \Eloquent
 */
class user_workstation extends Model
{
    protected $table = 'user_workstation';
    protected $fillable = ['user_id', 'workstation_id'];
}
