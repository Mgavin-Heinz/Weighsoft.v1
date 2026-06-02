<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeighbridgesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('weighbridges')) {
            Schema::create('weighbridges', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('ip_address');
                $table->string('code');
                $table->string('port_num');
                $table->string('display_port_num');
                $table->string('display_ip_address');
                $table->string('scale');
                $table->string('remote_display');
                $table->string('baud_rate');
                $table->string('display_baud_rate');
                $table->string('data_bits');
                $table->string('display_data_bits');
                $table->string('parity');
                $table->string('display_parity');
                $table->string('stop_bits');
                $table->string('display_stop_bits');
                $table->string('weight_reg');
                $table->string('weight_sep')->nullable();
                $table->string('weight_num_amt')->nullable();
                $table->string('weight_special')->nullable();
                $table->string('decimal_places');
                $table->string('stable_samples');
                $table->string('manual');
                $table->string('in_reverse');
                $table->float('weight');
                $table->unsignedBigInteger('workstation_id');
                $table->unsignedBigInteger('site_id');
                $table->unsignedBigInteger('company_id');
                $table->string('weighing_transaction_flag');
                $table->timestamps();
                $table->softDeletes(); // Enables soft deletes
            });
        } else {
            // Add columns if they do not exist
            Schema::table('weighbridges', function (Blueprint $table) {
                if (!Schema::hasColumn('weighbridges', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('weighbridges', 'ip_address')) {
                    $table->string('ip_address');
                }
                if (!Schema::hasColumn('weighbridges', 'code')) {
                    $table->string('code');
                }
                if (!Schema::hasColumn('weighbridges', 'port_num')) {
                    $table->string('port_num');
                }
                if (!Schema::hasColumn('weighbridges', 'scale')) {
                    $table->string('scale');
                }
                if (!Schema::hasColumn('weighbridges', 'remote_display')) {
                    $table->string('remote_display');
                }
                if (!Schema::hasColumn('weighbridges', 'baud_rate')) {
                    $table->string('baud_rate');
                }
                if (!Schema::hasColumn('weighbridges', 'data_bits')) {
                    $table->string('data_bits');
                }
                if (!Schema::hasColumn('weighbridges', 'parity')) {
                    $table->string('parity');
                }
                if (!Schema::hasColumn('weighbridges', 'stop_bits')) {
                    $table->string('stop_bits');
                }
                if (!Schema::hasColumn('weighbridges', 'weight_reg')) {
                    $table->string('weight_reg');
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
                if (!Schema::hasColumn('weighbridges', 'decimal_places')) {
                    $table->string('decimal_places');
                }
                if (!Schema::hasColumn('weighbridges', 'stable_samples')) {
                    $table->string('stable_samples');
                }
                if (!Schema::hasColumn('weighbridges', 'manual')) {
                    $table->string('manual');
                }
                if (!Schema::hasColumn('weighbridges', 'in_reverse')) {
                    $table->string('in_reverse');
                }
                if (!Schema::hasColumn('weighbridges', 'weight')) {
                    $table->float('weight');
                }
                if (!Schema::hasColumn('weighbridges', 'workstation_id')) {
                    $table->unsignedBigInteger('workstation_id');
                }
                if (!Schema::hasColumn('weighbridges', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                }
                if (!Schema::hasColumn('weighbridges', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                }
                if (!Schema::hasColumn('weighbridges', 'weighing_transaction_flag')) {
                    $table->string('weighing_transaction_flag');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('weighbridges');
    }
}
