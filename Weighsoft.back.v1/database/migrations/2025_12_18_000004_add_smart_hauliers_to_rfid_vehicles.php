<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddSmartHauliersToRfidVehicles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rfid_vehicles', function (Blueprint $table) {
            if (!Schema::hasColumn('rfid_vehicles', 'haulier_id')) {
                // Use unsignedInteger (INT UNSIGNED) to match hauliers.id type
                $table->unsignedInteger('haulier_id')->nullable()->after('rfid');
                // Add index for foreign key performance
                $table->index('haulier_id', 'idx_rfid_vehicles_haulier');
            }
            
            if (!Schema::hasColumn('rfid_vehicles', 'site_id')) {
                // Use unsignedInteger (INT UNSIGNED) to match sites.id type
                $table->unsignedInteger('site_id')->nullable()->after('haulier_id');
                // Add index for foreign key performance
                $table->index('site_id', 'idx_rfid_vehicles_site');
            }
        });

        // Add foreign keys in a separate step
        if (Schema::hasColumn('rfid_vehicles', 'haulier_id')) {
            // Check if foreign key already exists
            $foreignKeys = DB::select(
                "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'rfid_vehicles' 
                AND CONSTRAINT_NAME = 'rfid_vehicles_haulier_id_foreign'"
            );

            if (empty($foreignKeys)) {
                Schema::table('rfid_vehicles', function (Blueprint $table) {
                    $table->foreign('haulier_id', 'rfid_vehicles_haulier_id_foreign')
                        ->references('id')
                        ->on('hauliers')
                        ->onDelete('set null');
                });
            }
        }

        if (Schema::hasColumn('rfid_vehicles', 'site_id')) {
            // Check if foreign key already exists
            $foreignKeys = DB::select(
                "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'rfid_vehicles' 
                AND CONSTRAINT_NAME = 'rfid_vehicles_site_id_foreign'"
            );

            if (empty($foreignKeys)) {
                Schema::table('rfid_vehicles', function (Blueprint $table) {
                    $table->foreign('site_id', 'rfid_vehicles_site_id_foreign')
                        ->references('id')
                        ->on('sites')
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
        Schema::table('rfid_vehicles', function (Blueprint $table) {
            // Drop foreign keys first if they exist
            $haulierFK = DB::select(
                "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'rfid_vehicles' 
                AND CONSTRAINT_NAME = 'rfid_vehicles_haulier_id_foreign'"
            );

            if (!empty($haulierFK)) {
                $table->dropForeign('rfid_vehicles_haulier_id_foreign');
            }

            $siteFK = DB::select(
                "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'rfid_vehicles' 
                AND CONSTRAINT_NAME = 'rfid_vehicles_site_id_foreign'"
            );

            if (!empty($siteFK)) {
                $table->dropForeign('rfid_vehicles_site_id_foreign');
            }

            // Then drop columns if they exist
            if (Schema::hasColumn('rfid_vehicles', 'haulier_id')) {
                $table->dropColumn('haulier_id');
            }
            
            if (Schema::hasColumn('rfid_vehicles', 'site_id')) {
                $table->dropColumn('site_id');
            }
        });
    }
}

