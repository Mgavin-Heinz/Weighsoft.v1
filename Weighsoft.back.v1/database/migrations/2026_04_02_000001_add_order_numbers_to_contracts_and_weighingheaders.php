<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contracts') && !Schema::hasColumn('contracts', 'order_numbers')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->string('order_numbers', 255)->nullable();
            });
        }
        if (Schema::hasTable('weighingheaders') && !Schema::hasColumn('weighingheaders', 'order_numbers')) {
            Schema::table('weighingheaders', function (Blueprint $table) {
                $table->string('order_numbers', 255)->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('weighingheaders') && Schema::hasColumn('weighingheaders', 'order_numbers')) {
            Schema::table('weighingheaders', function (Blueprint $table) {
                $table->dropColumn('order_numbers');
            });
        }
        if (Schema::hasTable('contracts') && Schema::hasColumn('contracts', 'order_numbers')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->dropColumn('order_numbers');
            });
        }
    }
};
