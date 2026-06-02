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
                $table->foreignId('current_id')->constrained()->onDelete('cascade');
                $table->foreignId('settings_id')->constrained()->onDelete('cascade');
                $table->foreignId('site_id')->constrained()->onDelete('cascade');
                $table->foreignId('company_id')->constrained()->onDelete('cascade');
                $table->timestamps();
            });
        } else {
            Schema::table('transactions', function (Blueprint $table) {
                if (!Schema::hasColumn('transactions', 'current_id')) {
                    $table->foreignId('current_id')->constrained()->onDelete('cascade');
                }
                if (!Schema::hasColumn('transactions', 'settings_id')) {
                    $table->foreignId('settings_id')->constrained()->onDelete('cascade');
                }
                if (!Schema::hasColumn('transactions', 'site_id')) {
                    $table->foreignId('site_id')->constrained()->onDelete('cascade');
                }
                if (!Schema::hasColumn('transactions', 'company_id')) {
                    $table->foreignId('company_id')->constrained()->onDelete('cascade');
                }
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}