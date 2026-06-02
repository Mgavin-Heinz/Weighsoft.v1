<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddBusinessPartnerToHauliers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if businesspartners table exists first
        if (!Schema::hasTable('businesspartners')) {
            throw new \Exception('businesspartners table must exist before adding foreign key to hauliers');
        }

        Schema::table('hauliers', function (Blueprint $table) {
            if (!Schema::hasColumn('hauliers', 'business_partner_id')) {
                // Use unsignedInteger (INT UNSIGNED) to match businesspartners.id type
                $table->unsignedInteger('business_partner_id')->nullable()->after('site_id');
                // Add index for foreign key performance
                $table->index('business_partner_id', 'idx_hauliers_business_partner');
            }
        });

        // Add foreign key in a separate step to avoid constraint issues
        if (Schema::hasColumn('hauliers', 'business_partner_id')) {
            // Check if foreign key already exists
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

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('hauliers', function (Blueprint $table) {
            // Drop foreign key first if it exists
            $foreignKeys = DB::select(
                "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'hauliers' 
                AND CONSTRAINT_NAME LIKE '%business_partner%'"
            );

            if (!empty($foreignKeys)) {
                $table->dropForeign('hauliers_business_partner_id_foreign');
            }

            // Then drop column if it exists
            if (Schema::hasColumn('hauliers', 'business_partner_id')) {
                $table->dropColumn('business_partner_id');
            }
        });
    }
}

