<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContractTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('contract_transactions')) {
            Schema::create('contract_transactions', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('contract_id');
                $table->decimal('amount', 15, 2);
                $table->unsignedBigInteger('weighing_header_id')->nullable();
                $table->unsignedBigInteger('site_id');
                $table->unsignedBigInteger('company_id');
                $table->timestamps();
                $table->softDeletes();

                // Foreign key constraints
                $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('cascade');
                $table->foreign('weighing_header_id')->references('id')->on('weighingheaders')->onDelete('set null');
                $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            });
        } else {
            // Add columns if they do not exist
            Schema::table('contract_transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('contract_transactions', 'contract_id')) {
                    $table->unsignedBigInteger('contract_id');
                    $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('cascade');
                }
                if (!Schema::hasColumn('contract_transactions', 'amount')) {
                    $table->decimal('amount', 15, 2);
                }
                if (!Schema::hasColumn('contract_transactions', 'weighing_header_id')) {
                    $table->unsignedBigInteger('weighing_header_id')->nullable();
                    $table->foreign('weighing_header_id')->references('id')->on('weighingheaders')->onDelete('set null');
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

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Drop the table if it exists
        if (Schema::hasTable('contract_transactions')) {
            Schema::dropIfExists('contract_transactions');
        }
    }
}
