<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Replace combined Incoming/Exiting Light (one relay each) with separate
 * Incoming/Exiting Red and Green lights (four relays total).
 * Booms unchanged.
 */
class WorkstationsSixRelayLights extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('workstations', function (Blueprint $table) {
            if (!Schema::hasColumn('workstations', 'incoming_red_light_ip')) {
                $table->string('incoming_red_light_ip')->nullable()->after('exiting_boom_relay');
            }
            if (!Schema::hasColumn('workstations', 'incoming_red_light_relay')) {
                $table->unsignedTinyInteger('incoming_red_light_relay')->nullable()->after('incoming_red_light_ip');
            }
            if (!Schema::hasColumn('workstations', 'incoming_green_light_ip')) {
                $table->string('incoming_green_light_ip')->nullable()->after('incoming_red_light_relay');
            }
            if (!Schema::hasColumn('workstations', 'incoming_green_light_relay')) {
                $table->unsignedTinyInteger('incoming_green_light_relay')->nullable()->after('incoming_green_light_ip');
            }
            if (!Schema::hasColumn('workstations', 'exiting_red_light_ip')) {
                $table->string('exiting_red_light_ip')->nullable()->after('incoming_green_light_relay');
            }
            if (!Schema::hasColumn('workstations', 'exiting_red_light_relay')) {
                $table->unsignedTinyInteger('exiting_red_light_relay')->nullable()->after('exiting_red_light_ip');
            }
            if (!Schema::hasColumn('workstations', 'exiting_green_light_ip')) {
                $table->string('exiting_green_light_ip')->nullable()->after('exiting_red_light_relay');
            }
            if (!Schema::hasColumn('workstations', 'exiting_green_light_relay')) {
                $table->unsignedTinyInteger('exiting_green_light_relay')->nullable()->after('exiting_green_light_ip');
            }
        });

        // Copy legacy "Incoming/Exiting Light" into Green columns before dropping
        if (Schema::hasColumn('workstations', 'incoming_light_ip')) {
            DB::table('workstations')
                ->whereNotNull('incoming_light_ip')
                ->update([
                    'incoming_green_light_ip' => DB::raw('incoming_light_ip'),
                    'incoming_green_light_relay' => DB::raw('incoming_light_relay'),
                ]);
        }
        if (Schema::hasColumn('workstations', 'exiting_light_ip')) {
            DB::table('workstations')
                ->whereNotNull('exiting_light_ip')
                ->update([
                    'exiting_green_light_ip' => DB::raw('exiting_light_ip'),
                    'exiting_green_light_relay' => DB::raw('exiting_light_relay'),
                ]);
        }

        Schema::table('workstations', function (Blueprint $table) {
            if (Schema::hasColumn('workstations', 'incoming_light_ip')) {
                $table->dropColumn('incoming_light_ip');
            }
            if (Schema::hasColumn('workstations', 'incoming_light_relay')) {
                $table->dropColumn('incoming_light_relay');
            }
            if (Schema::hasColumn('workstations', 'exiting_light_ip')) {
                $table->dropColumn('exiting_light_ip');
            }
            if (Schema::hasColumn('workstations', 'exiting_light_relay')) {
                $table->dropColumn('exiting_light_relay');
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
            if (!Schema::hasColumn('workstations', 'incoming_light_ip')) {
                $table->string('incoming_light_ip')->nullable()->after('exiting_boom_relay');
            }
            if (!Schema::hasColumn('workstations', 'incoming_light_relay')) {
                $table->integer('incoming_light_relay')->nullable()->after('incoming_light_ip');
            }
            if (!Schema::hasColumn('workstations', 'exiting_light_ip')) {
                $table->string('exiting_light_ip')->nullable()->after('incoming_light_relay');
            }
            if (!Schema::hasColumn('workstations', 'exiting_light_relay')) {
                $table->integer('exiting_light_relay')->nullable()->after('exiting_light_ip');
            }
        });

        if (Schema::hasColumn('workstations', 'incoming_green_light_ip')) {
            DB::table('workstations')->update([
                'incoming_light_ip' => DB::raw('incoming_green_light_ip'),
                'incoming_light_relay' => DB::raw('incoming_green_light_relay'),
            ]);
        }
        if (Schema::hasColumn('workstations', 'exiting_green_light_ip')) {
            DB::table('workstations')->update([
                'exiting_light_ip' => DB::raw('exiting_green_light_ip'),
                'exiting_light_relay' => DB::raw('exiting_green_light_relay'),
            ]);
        }

        Schema::table('workstations', function (Blueprint $table) {
            $cols = [
                'incoming_red_light_ip', 'incoming_red_light_relay',
                'incoming_green_light_ip', 'incoming_green_light_relay',
                'exiting_red_light_ip', 'exiting_red_light_relay',
                'exiting_green_light_ip', 'exiting_green_light_relay',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('workstations', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
}
