<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRfidVehiclesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('rfid_vehicles')) {
            Schema::create('rfid_vehicles', function (Blueprint $table) {
                $table->id();
                $table->string('registration_number');
                $table->string('rfid');
                $table->unsignedBigInteger('company_id')->nullable();
                $table->timestamps();

                // Foreign key constraints
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            });
        } else {
            // Add columns if they do not exist
            Schema::table('rfid_vehicles', function (Blueprint $table) {
                if (!Schema::hasColumn('rfid_vehicles', 'registration_number')) {
                    $table->string('registration_number');
                }
                if (!Schema::hasColumn('rfid_vehicles', 'rfid')) {
                    $table->string('rfid');
                }
                if (!Schema::hasColumn('rfid_vehicles', 'company_id')) {
                    $table->unsignedBigInteger('company_id')->nullable();
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('rfid_vehicles', 'created_at')) {
                    $table->timestamps();
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
        // Drop the table if it exists
        if (Schema::hasTable('rfid_vehicles')) {
            Schema::dropIfExists('rfid_vehicles');
        }
    }
}
