<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkStationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('workstations')) {
            Schema::create('workstations', function (Blueprint $table) {
                $table->id(); // Auto-incrementing primary key (bigint)
                $table->string('workstation_type');
                $table->string('workstation_name');
                $table->string('workstation_active');
                $table->unsignedInteger('site_id');
                $table->unsignedInteger('company_id');
                $table->timestamps(); // Creates 'created_at' and 'updated_at' columns
                $table->softDeletes(); // Creates 'deleted_at' column for soft deletes
            });
        } else {
            // Add columns if they do not exist
            Schema::table('workstations', function (Blueprint $table) {
                if (!Schema::hasColumn('workstations', 'workstation_type')) {
                    $table->string('workstation_type');
                }
                if (!Schema::hasColumn('workstations', 'workstation_name')) {
                    $table->string('workstation_name');
                }
                if (!Schema::hasColumn('workstations', 'workstation_active')) {
                    $table->string('workstation_active');
                }
                if (!Schema::hasColumn('workstations', 'site_id')) {
                    $table->unsignedInteger('site_id');
                }
                if (!Schema::hasColumn('workstations', 'company_id')) {
                    $table->unsignedInteger('company_id');
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
        Schema::dropIfExists('workstations');
    }
}
