<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePalletsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('pallets')) {
            Schema::create('pallets', function (Blueprint $table) {
                $table->id('pallet_id');
                $table->string('pallet_name');
                $table->string('amount');
                $table->unsignedBigInteger('company_id');
                $table->unsignedBigInteger('site_id');
                $table->timestamps();

                // Foreign key constraints
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
            });
        } else {
            // Add columns if they do not exist
            Schema::table('pallets', function (Blueprint $table) {
                if (!Schema::hasColumn('pallets', 'pallet_id')) {
                    $table->id('pallet_id');
                }
                if (!Schema::hasColumn('pallets', 'pallet_name')) {
                    $table->string('pallet_name');
                }
                if (!Schema::hasColumn('pallets', 'amount')) {
                    $table->string('amount');
                }
                if (!Schema::hasColumn('pallets', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('pallets', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                    $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                }
                if (!Schema::hasColumn('pallets', 'created_at')) {
                    $table->timestamps();
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
        if (Schema::hasTable('pallets')) {
            Schema::dropIfExists('pallets');
        }
    }
}
