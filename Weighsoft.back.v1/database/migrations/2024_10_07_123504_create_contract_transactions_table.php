<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContractTransactionsTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('contract_transactions')) {
            Schema::create('contract_transactions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('contract_id');
                $table->decimal('amount', 15, 2);
                // weighingheaders.id is a string primary key so we store this
                // as a nullable string and skip the foreign key constraint to
                // avoid a type mismatch error.
                $table->string('weighing_header_id')->nullable();
                $table->unsignedBigInteger('site_id');
                $table->unsignedBigInteger('company_id');
                $table->timestamps();
                $table->softDeletes();

                $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('cascade');
                $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            });
        } else {
            Schema::table('contract_transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('contract_transactions', 'contract_id')) {
                    $table->unsignedBigInteger('contract_id');
                    $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('cascade');
                }
                if (!Schema::hasColumn('contract_transactions', 'amount')) {
                    $table->decimal('amount', 15, 2);
                }
                if (!Schema::hasColumn('contract_transactions', 'weighing_header_id')) {
                    $table->string('weighing_header_id')->nullable();
                }
                if (!Schema::hasColumn('contract_transactions', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                    $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                }
                if (!Schema::hasColumn('contract_transactions', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('contract_transactions', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('contract_transactions', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('contract_transactions')) {
            Schema::dropIfExists('contract_transactions');
        }
    }
}