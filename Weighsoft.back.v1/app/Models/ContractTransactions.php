<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * App\Models\ContractTransactions
 *
 * @property mixed $id
 * @property int $contract_id
 * @property float $amount
 * @property mixed|null $weighing_header_id
 * @property int $site_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property int $company_id
 * @property-read \App\Models\Company $company
 * @property-read \App\Models\Contracts $contract
 * @property-read mixed $contract_name
 * @property-read bool $has_transaction
 * @property-read \App\Models\Site $site
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions newQuery()
 * @method static \Illuminate\Database\Query\Builder|ContractTransactions onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions query()
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereContractId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereSiteId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ContractTransactions whereWeighingHeaderId($value)
 * @method static \Illuminate\Database\Query\Builder|ContractTransactions withTrashed()
 * @method static \Illuminate\Database\Query\Builder|ContractTransactions withoutTrashed()
 * @mixin \Eloquent
 */
class ContractTransactions extends Model
{
    use SoftDeletes;

    protected $table = 'contract_transactions';
    protected $fillable = ['contract_id', 'amount', 'weighing_header_id', 'site_id', 'site_id', 'company_id'];
    // protected $keyType = "uuid";

    public function company(): BelongsTo
    {
        return $this->belongsTo('App\Models\Company');
    }

    public function site(): BelongsTo
    {
        return $this->belongsTo('App\Models\Site');
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo('App\Models\Contracts', 'contract_id');
    }
    public function getContractNameAttribute() {
        return $this->contract->name;
    }

    public function getHasTransactionAttribute(): bool
    {
        return (bool)$this->contract;
    }
}
