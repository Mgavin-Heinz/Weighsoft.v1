<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddSmartHauliersToRfidVehicles extends Migration
{
    public function up()
    {
        Schema::table('rfid_vehicles', function (Blueprint $table) {
            if (!Schema::hasColumn('rfid_vehicles', 'haulier_id')) {
                $table->unsignedBigInteger('haulier_id')->nullable()->after('rfid');
                $table->index('haulier_id', 'idx_rfid_vehicles_haulier');
            }
            if (!Schema::hasColumn('rfid_vehicles', 'site_id')) {
                $table->unsignedBigInteger('site_id')->nullable()->after('haulier_id');
                $table->index('site_id', 'idx_rfid_vehicles_site');
            }
        });

        if (Schema::hasColumn('rfid_vehicles', 'haulier_id')) {
            $fk = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rfid_vehicles' AND CONSTRAINT_NAME = 'rfid_vehicles_haulier_id_foreign'");
            if (empty($fk)) {
                Schema::table('rfid_vehicles', function (Blueprint $table) {
                    $table->foreign('haulier_id', 'rfid_vehicles_haulier_id_foreign')->references('id')->on('hauliers')->onDelete('set null');
                });
            }
        }

        if (Schema::hasColumn('rfid_vehicles', 'site_id')) {
            $fk = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rfid_vehicles' AND CONSTRAINT_NAME = 'rfid_vehicles_site_id_foreign'");
            if (empty($fk)) {
                Schema::table('rfid_vehicles', function (Blueprint $table) {
                    $table->foreign('site_id', 'rfid_vehicles_site_id_foreign')->references('id')->on('sites')->onDelete('set null');
                });
            }
        }
    }

    public function down()
    {
        Schema::table('rfid_vehicles', function (Blueprint $table) {
            if (Schema::hasColumn('rfid_vehicles', 'haulier_id')) {
                try { $table->dropForeign('rfid_vehicles_haulier_id_foreign'); } catch (\Exception $e) {}
                $table->dropColumn('haulier_id');
            }
            if (Schema::hasColumn('rfid_vehicles', 'site_id')) {
                try { $table->dropForeign('rfid_vehicles_site_id_foreign'); } catch (\Exception $e) {}
                $table->dropColumn('site_id');
            }
        });
    }
}