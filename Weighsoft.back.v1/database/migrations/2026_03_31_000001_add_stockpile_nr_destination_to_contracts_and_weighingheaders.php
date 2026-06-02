<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contracts') && !Schema::hasColumn('contracts', 'stockpile_nr')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->string('stockpile_nr', 255)->nullable();
            });
        }
        if (Schema::hasTable('contracts') && !Schema::hasColumn('contracts', 'destination')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->string('destination', 255)->nullable();
            });
        }

        if (Schema::hasTable('weighingheaders') && !Schema::hasColumn('weighingheaders', 'stockpile_nr')) {
            Schema::table('weighingheaders', function (Blueprint $table) {
                $table->string('stockpile_nr', 255)->nullable();
            });
        }
        if (Schema::hasTable('weighingheaders') && !Schema::hasColumn('weighingheaders', 'destination')) {
            Schema::table('weighingheaders', function (Blueprint $table) {
                $table->string('destination', 255)->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('contracts') && Schema::hasColumn('contracts', 'destination')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->dropColumn('destination');
            });
        }
        if (Schema::hasTable('contracts') && Schema::hasColumn('contracts', 'stockpile_nr')) {
            Schema::table('contracts', function (Blueprint $table) {
                $table->dropColumn('stockpile_nr');
            });
        }

        if (Schema::hasTable('weighingheaders') && Schema::hasColumn('weighingheaders', 'destination')) {
            Schema::table('weighingheaders', function (Blueprint $table) {
                $table->dropColumn('destination');
            });
        }
        if (Schema::hasTable('weighingheaders') && Schema::hasColumn('weighingheaders', 'stockpile_nr')) {
            Schema::table('weighingheaders', function (Blueprint $table) {
                $table->dropColumn('stockpile_nr');
            });
        }
    }
};
