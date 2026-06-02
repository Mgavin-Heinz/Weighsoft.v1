<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBoomLightIpsToWeighbridges extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('weighbridges', function (Blueprint $table) {
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
        });
    }
}

