<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('transactions')) {
            Schema::create('transactions', function (Blueprint $table) {
                $table->id();
                // current_id references a 'currents' table that does not exist
                // in this codebase — stored as a plain nullable integer instead.
                $table->unsignedBigInteger('current_id')->nullable();
                $table->unsignedBigInteger('settings_id')->nullable();
                $table->unsignedBigInteger('site_id')->nullable();
                $table->unsignedBigInteger('company_id')->nullable();
                $table->timestamps();

                $table->foreign('settings_id')->references('id')->on('settings')->onDelete('cascade');
                $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            });
        } else {
            Schema::table('transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('transactions', 'current_id')) {
                    $table->unsignedBigInteger('current_id')->nullable();
                }
                if (!Schema::hasColumn('transactions', 'settings_id')) {
                    $table->unsignedBigInteger('settings_id')->nullable();
                    $table->foreign('settings_id')->references('id')->on('settings')->onDelete('cascade');
                }
                if (!Schema::hasColumn('transactions', 'site_id')) {
                    $table->unsignedBigInteger('site_id')->nullable();
                    $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                }
                if (!Schema::hasColumn('transactions', 'company_id')) {
                    $table->unsignedBigInteger('company_id')->nullable();
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}