<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddEsp32FieldsToWorkstationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('workstations', function (Blueprint $table) {
            // Add ESP32 IP addresses
            if (!Schema::hasColumn('workstations', 'incoming_boom_ip')) {
                $table->string('incoming_boom_ip')->nullable()->after('workstation_active');
            }
            if (!Schema::hasColumn('workstations', 'exiting_boom_ip')) {
                $table->string('exiting_boom_ip')->nullable()->after('incoming_boom_ip');
            }
            if (!Schema::hasColumn('workstations', 'incoming_light_ip')) {
                $table->string('incoming_light_ip')->nullable()->after('exiting_boom_ip');
            }
            if (!Schema::hasColumn('workstations', 'exiting_light_ip')) {
                $table->string('exiting_light_ip')->nullable()->after('incoming_light_ip');
            }
            
            // Add ESP32 relay numbers
            if (!Schema::hasColumn('workstations', 'incoming_boom_relay')) {
                $table->integer('incoming_boom_relay')->nullable()->after('exiting_light_ip');
            }
            if (!Schema::hasColumn('workstations', 'exiting_boom_relay')) {
                $table->integer('exiting_boom_relay')->nullable()->after('incoming_boom_relay');
            }
            if (!Schema::hasColumn('workstations', 'incoming_light_relay')) {
                $table->integer('incoming_light_relay')->nullable()->after('exiting_boom_relay');
            }
            if (!Schema::hasColumn('workstations', 'exiting_light_relay')) {
                $table->integer('exiting_light_relay')->nullable()->after('incoming_light_relay');
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
        Schema::table('workstations', function (Blueprint $table) {
            $table->dropColumn([
                'incoming_boom_ip',
                'exiting_boom_ip',
                'incoming_light_ip',
                'exiting_light_ip',
                'incoming_boom_relay',
                'exiting_boom_relay',
                'incoming_light_relay',
                'exiting_light_relay'
            ]);
        });
    }
}

