<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropEsp32FieldsFromWeighbridgesTable extends Migration
{
    /**
     * Run the migrations.
     * 
     * ESP32 boom and light control has been moved to the workstations table.
     * This migration removes the old weighbridge-level ESP32 configuration.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('weighbridges', function (Blueprint $table) {
            // Drop ESP32 IP addresses
            if (Schema::hasColumn('weighbridges', 'incoming_boom_ip')) {
                $table->dropColumn('incoming_boom_ip');
            }
            if (Schema::hasColumn('weighbridges', 'exiting_boom_ip')) {
                $table->dropColumn('exiting_boom_ip');
            }
            if (Schema::hasColumn('weighbridges', 'incoming_light_ip')) {
                $table->dropColumn('incoming_light_ip');
            }
            if (Schema::hasColumn('weighbridges', 'exiting_light_ip')) {
                $table->dropColumn('exiting_light_ip');
            }
            
            // Drop ESP32 relay numbers
            if (Schema::hasColumn('weighbridges', 'incoming_boom_relay')) {
                $table->dropColumn('incoming_boom_relay');
            }
            if (Schema::hasColumn('weighbridges', 'exiting_boom_relay')) {
                $table->dropColumn('exiting_boom_relay');
            }
            if (Schema::hasColumn('weighbridges', 'incoming_light_relay')) {
                $table->dropColumn('incoming_light_relay');
            }
            if (Schema::hasColumn('weighbridges', 'exiting_light_relay')) {
                $table->dropColumn('exiting_light_relay');
            }
        });
    }

    /**
     * Reverse the migrations.
     * 
     * Note: This will restore the columns to weighbridges, but this is likely
     * not desired since ESP32 control has been moved to workstations.
     * Only run this if you need to rollback the architectural change.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('weighbridges', function (Blueprint $table) {
            // Restore ESP32 IP addresses
            if (!Schema::hasColumn('weighbridges', 'incoming_boom_ip')) {
                $table->string('incoming_boom_ip')->nullable()->after('weighing_transaction_flag');
            }
            if (!Schema::hasColumn('weighbridges', 'exiting_boom_ip')) {
                $table->string('exiting_boom_ip')->nullable()->after('incoming_boom_ip');
            }
            if (!Schema::hasColumn('weighbridges', 'incoming_light_ip')) {
                $table->string('incoming_light_ip')->nullable()->after('exiting_boom_ip');
            }
            if (!Schema::hasColumn('weighbridges', 'exiting_light_ip')) {
                $table->string('exiting_light_ip')->nullable()->after('incoming_light_ip');
            }
            
            // Restore ESP32 relay numbers
            if (!Schema::hasColumn('weighbridges', 'incoming_boom_relay')) {
                $table->integer('incoming_boom_relay')->nullable()->after('exiting_light_ip');
            }
            if (!Schema::hasColumn('weighbridges', 'exiting_boom_relay')) {
                $table->integer('exiting_boom_relay')->nullable()->after('incoming_boom_relay');
            }
            if (!Schema::hasColumn('weighbridges', 'incoming_light_relay')) {
                $table->integer('incoming_light_relay')->nullable()->after('exiting_boom_relay');
            }
            if (!Schema::hasColumn('weighbridges', 'exiting_light_relay')) {
                $table->integer('exiting_light_relay')->nullable()->after('incoming_light_relay');
            }
        });
    }
}

