<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCamerasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('cameras')) {
            Schema::create('cameras', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('pn_recog');
                $table->string('ip_address');
                $table->boolean('camera_active');
                $table->foreignId('weighbridge_id')->constrained('weighbridges');  // Assuming a 'weighbridges' table exists
                $table->foreignId('workstation_id')->constrained('workstations');  // Assuming a 'workstations' table exists
                $table->foreignId('site_id')->constrained('sites');  // Assuming a 'sites' table exists
                $table->foreignId('company_id')->constrained('companies');  // Assuming a 'companies' table exists
                $table->timestamps();
                $table->softDeletes();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('cameras', function (Blueprint $table) {
                if (!Schema::hasColumn('cameras', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('cameras', 'pn_recog')) {
                    $table->string('pn_recog');
                }
                if (!Schema::hasColumn('cameras', 'ip_address')) {
                    $table->string('ip_address');
                }
                if (!Schema::hasColumn('cameras', 'camera_active')) {
                    $table->boolean('camera_active');
                }
                if (!Schema::hasColumn('cameras', 'weighbridge_id')) {
                    $table->foreignId('weighbridge_id')->constrained('weighbridges');  // Assuming a 'weighbridges' table exists
                }
                if (!Schema::hasColumn('cameras', 'workstation_id')) {
                    $table->foreignId('workstation_id')->constrained('workstations');  // Assuming a 'workstations' table exists
                }
                if (!Schema::hasColumn('cameras', 'site_id')) {
                    $table->foreignId('site_id')->constrained('sites');  // Assuming a 'sites' table exists
                }
                if (!Schema::hasColumn('cameras', 'company_id')) {
                    $table->foreignId('company_id')->constrained('companies');  // Assuming a 'companies' table exists
                }
                if (!Schema::hasColumn('cameras', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('cameras', 'deleted_at')) {
                    $table->softDeletes();
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
        if (Schema::hasTable('cameras')) {
            Schema::dropIfExists('cameras');
        }
    }
}
