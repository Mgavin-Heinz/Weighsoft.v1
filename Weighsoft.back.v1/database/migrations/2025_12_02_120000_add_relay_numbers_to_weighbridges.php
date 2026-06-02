<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRelayNumbersToWeighbridges extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds relay number fields (1-8) for each boom/light entity.
     * Each weighbridge can have ONE ESP32 device (shared IP) controlling multiple relays.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('weighbridges', function (Blueprint $table) {
            // Add relay number fields (1-8) for each entity
            if (!Schema::hasColumn('weighbridges', 'incoming_boom_relay')) {
                $table->tinyInteger('incoming_boom_relay')->nullable()->after('incoming_boom_ip')
                    ->comment('ESP32 relay number (1-8) for incoming boom');
            }
            if (!Schema::hasColumn('weighbridges', 'exiting_boom_relay')) {
                $table->tinyInteger('exiting_boom_relay')->nullable()->after('exiting_boom_ip')
                    ->comment('ESP32 relay number (1-8) for exiting boom');
            }
            if (!Schema::hasColumn('weighbridges', 'incoming_light_relay')) {
                $table->tinyInteger('incoming_light_relay')->nullable()->after('incoming_light_ip')
                    ->comment('ESP32 relay number (1-8) for incoming light');
            }
            if (!Schema::hasColumn('weighbridges', 'exiting_light_relay')) {
                $table->tinyInteger('exiting_light_relay')->nullable()->after('exiting_light_ip')
                    ->comment('ESP32 relay number (1-8) for exiting light');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('weighbridges', function (Blueprint $table) {
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
}

