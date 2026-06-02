<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveUnusedColumnsFromWeighbridges extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('weighbridges', function (Blueprint $table) {
            $columns = [
                'ip_address',
                'display_ip_address',
                'remote_display',
                'baud_rate',
                'display_baud_rate',
                'data_bits',
                'display_data_bits',
                'parity',
                'display_parity',
                'stop_bits',
                'display_stop_bits',
                'weight_reg',
                'weight_sep',
                'weight_num_amt',
                'weight_special'
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('weighbridges', $column)) {
                    $table->dropColumn($column);
                }
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
            // Only add columns if they don't exist
            if (!Schema::hasColumn('weighbridges', 'ip_address')) {
                $table->string('ip_address')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'display_ip_address')) {
                $table->string('display_ip_address')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'remote_display')) {
                $table->string('remote_display')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'baud_rate')) {
                $table->string('baud_rate')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'display_baud_rate')) {
                $table->string('display_baud_rate')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'data_bits')) {
                $table->string('data_bits')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'display_data_bits')) {
                $table->string('display_data_bits')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'parity')) {
                $table->string('parity')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'display_parity')) {
                $table->string('display_parity')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'stop_bits')) {
                $table->string('stop_bits')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'display_stop_bits')) {
                $table->string('display_stop_bits')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'weight_reg')) {
                $table->string('weight_reg')->default('');
            }
            if (!Schema::hasColumn('weighbridges', 'weight_sep')) {
                $table->string('weight_sep')->nullable();
            }
            if (!Schema::hasColumn('weighbridges', 'weight_num_amt')) {
                $table->string('weight_num_amt')->nullable();
            }
            if (!Schema::hasColumn('weighbridges', 'weight_special')) {
                $table->string('weight_special')->nullable();
            }
        });
    }
} 