<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeighingTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('weighingtransactions')) {
            Schema::create('weighingtransactions', function (Blueprint $table) {
                $table->string('id')->primary(); // Assuming id is a string and primary key
                $table->string('Status');
                $table->string('Weight1');
                $table->string('Weight2');
                $table->string('Weight3');
                $table->string('Weight4');
                $table->string('Weight5');
                $table->string('Weight6');
                $table->string('WeightTotal');
                $table->string('weighing_header_id')->nullable(); // Nullable as per model definition
                $table->unsignedInteger('site_id');
                $table->unsignedInteger('workstation_id')->nullable(); // Nullable as per model definition
                $table->unsignedInteger('company_id');
                $table->unsignedInteger('AxelSetups')->nullable(); // Nullable as per model definition
                $table->timestamps(); // This will create 'created_at' and 'updated_at' columns
                $table->softDeletes(); // This will create 'deleted_at' column for soft deletes
            });
        } else {
            // Add columns if they do not exist
            Schema::table('weighingtransactions', function (Blueprint $table) {
                if (!Schema::hasColumn('weighingtransactions', 'Status')) {
                    $table->string('Status');
                }
                if (!Schema::hasColumn('weighingtransactions', 'Weight1')) {
                    $table->string('Weight1');
                }
                if (!Schema::hasColumn('weighingtransactions', 'Weight2')) {
                    $table->string('Weight2');
                }
                if (!Schema::hasColumn('weighingtransactions', 'Weight3')) {
                    $table->string('Weight3');
                }
                if (!Schema::hasColumn('weighingtransactions', 'Weight4')) {
                    $table->string('Weight4');
                }
                if (!Schema::hasColumn('weighingtransactions', 'Weight5')) {
                    $table->string('Weight5');
                }
                if (!Schema::hasColumn('weighingtransactions', 'Weight6')) {
                    $table->string('Weight6');
                }
                if (!Schema::hasColumn('weighingtransactions', 'WeightTotal')) {
                    $table->string('WeightTotal');
                }
                if (!Schema::hasColumn('weighingtransactions', 'weighing_header_id')) {
                    $table->string('weighing_header_id')->nullable();
                }
                if (!Schema::hasColumn('weighingtransactions', 'site_id')) {
                    $table->unsignedInteger('site_id');
                }
                if (!Schema::hasColumn('weighingtransactions', 'workstation_id')) {
                    $table->unsignedInteger('workstation_id')->nullable();
                }
                if (!Schema::hasColumn('weighingtransactions', 'company_id')) {
                    $table->unsignedInteger('company_id');
                }
                if (!Schema::hasColumn('weighingtransactions', 'AxelSetups')) {
                    $table->unsignedInteger('AxelSetups')->nullable();
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
        Schema::dropIfExists('weighingtransactions');
    }
}
