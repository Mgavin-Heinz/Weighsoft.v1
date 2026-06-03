<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddBusinessPartnerToHauliers extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('businesspartners')) {
            return; // Skip silently if table doesn't exist
        }

        Schema::table('hauliers', function (Blueprint $table) {
            if (!Schema::hasColumn('hauliers', 'business_partner_id')) {
                // Use unsignedBigInteger to match businesspartners.id type
                $table->unsignedBigInteger('business_partner_id')->nullable()->after('site_id');
                $table->index('business_partner_id', 'idx_hauliers_business_partner');
            }
        });

        if (Schema::hasColumn('hauliers', 'business_partner_id')) {
            $foreignKeys = DB::select(
                "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'hauliers'
                AND CONSTRAINT_NAME = 'hauliers_business_partner_id_foreign'"
            );
            if (empty($foreignKeys)) {
                Schema::table('hauliers', function (Blueprint $table) {
                    $table->foreign('business_partner_id', 'hauliers_business_partner_id_foreign')
                        ->references('id')
                        ->on('businesspartners')
                        ->onDelete('set null');
                });
            }
        }
    }

    public function down()
    {
        Schema::table('hauliers', function (Blueprint $table) {
            if (Schema::hasColumn('hauliers', 'business_partner_id')) {
                try { $table->dropForeign('hauliers_business_partner_id_foreign'); } catch (\Exception $e) {}
                $table->dropColumn('business_partner_id');
            }
        });
    }
}