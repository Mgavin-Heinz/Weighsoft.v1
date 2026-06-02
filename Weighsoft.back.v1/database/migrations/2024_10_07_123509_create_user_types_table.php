<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('usertypes')) {
            Schema::create('usertypes', function (Blueprint $table) {
                $table->id();
                $table->string('usertypes');
                $table->string('level')->nullable();
                $table->string('companies');
                $table->string('sites');
                $table->string('workstations');
                $table->string('weighbridges')->nullable();
                $table->string('cameras');
                $table->string('weigh_types')->nullable();
                $table->string('weighing');
                $table->string('verify');
                $table->string('reprint');
                $table->string('business_partner');
                $table->string('products');
                $table->string('hauliers');
                $table->string('stored_tares')->nullable();
                $table->string('rfid_vehicle')->nullable();
                $table->string('axel_types')->nullable();
                $table->string('axel_settings')->nullable();
                $table->string('transaction_report')->nullable();
                $table->string('exception_report')->nullable();
                $table->string('users')->nullable();
                $table->string('user_types')->nullable();
                $table->string('delete_transaction_flag');
                $table->timestamps();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('usertypes', function (Blueprint $table) {
                if (!Schema::hasColumn('usertypes', 'usertypes')) {
                    $table->string('usertypes');
                }
                if (!Schema::hasColumn('usertypes', 'level')) {
                    $table->string('level')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'companies')) {
                    $table->string('companies');
                }
                if (!Schema::hasColumn('usertypes', 'sites')) {
                    $table->string('sites');
                }
                if (!Schema::hasColumn('usertypes', 'workstations')) {
                    $table->string('workstations');
                }
                if (!Schema::hasColumn('usertypes', 'weighbridges')) {
                    $table->string('weighbridges')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'cameras')) {
                    $table->string('cameras');
                }
                if (!Schema::hasColumn('usertypes', 'weigh_types')) {
                    $table->string('weigh_types')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'weighing')) {
                    $table->string('weighing');
                }
                if (!Schema::hasColumn('usertypes', 'verify')) {
                    $table->string('verify');
                }
                if (!Schema::hasColumn('usertypes', 'reprint')) {
                    $table->string('reprint');
                }
                if (!Schema::hasColumn('usertypes', 'business_partner')) {
                    $table->string('business_partner');
                }
                if (!Schema::hasColumn('usertypes', 'products')) {
                    $table->string('products');
                }
                if (!Schema::hasColumn('usertypes', 'hauliers')) {
                    $table->string('hauliers');
                }
                if (!Schema::hasColumn('usertypes', 'stored_tares')) {
                    $table->string('stored_tares')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'rfid_vehicle')) {
                    $table->string('rfid_vehicle')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'axel_types')) {
                    $table->string('axel_types')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'axel_settings')) {
                    $table->string('axel_settings')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'transaction_report')) {
                    $table->string('transaction_report')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'exception_report')) {
                    $table->string('exception_report')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'users')) {
                    $table->string('users')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'user_types')) {
                    $table->string('user_types')->nullable();
                }
                if (!Schema::hasColumn('usertypes', 'delete_transaction_flag')) {
                    $table->string('delete_transaction_flag');
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
        Schema::dropIfExists('usertypes');
    }
}
