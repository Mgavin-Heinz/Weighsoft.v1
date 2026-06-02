<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAxelSetupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('axelsetups')) {
            Schema::create('axelsetups', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('steering');
                $table->integer('steering_max');
                $table->string('axel_1');
                $table->integer('axel_1_max');
                $table->string('axel_2')->nullable();
                $table->integer('axel_2_max')->nullable();
                $table->string('axel_3')->nullable();
                $table->integer('axel_3_max')->nullable();
                $table->string('axel_4')->nullable();
                $table->integer('axel_4_max')->nullable();
                $table->integer('vehicle_max');
                $table->foreignId('company_id')->constrained('companies'); // Assuming a 'companies' table exists
                $table->timestamps();
                $table->softDeletes();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('axelsetups', function (Blueprint $table) {
                if (!Schema::hasColumn('axelsetups', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('axelsetups', 'steering')) {
                    $table->string('steering');
                }
                if (!Schema::hasColumn('axelsetups', 'steering_max')) {
                    $table->integer('steering_max');
                }
                if (!Schema::hasColumn('axelsetups', 'axel_1')) {
                    $table->string('axel_1');
                }
                if (!Schema::hasColumn('axelsetups', 'axel_1_max')) {
                    $table->integer('axel_1_max');
                }
                if (!Schema::hasColumn('axelsetups', 'axel_2')) {
                    $table->string('axel_2')->nullable();
                }
                if (!Schema::hasColumn('axelsetups', 'axel_2_max')) {
                    $table->integer('axel_2_max')->nullable();
                }
                if (!Schema::hasColumn('axelsetups', 'axel_3')) {
                    $table->string('axel_3')->nullable();
                }
                if (!Schema::hasColumn('axelsetups', 'axel_3_max')) {
                    $table->integer('axel_3_max')->nullable();
                }
                if (!Schema::hasColumn('axelsetups', 'axel_4')) {
                    $table->string('axel_4')->nullable();
                }
                if (!Schema::hasColumn('axelsetups', 'axel_4_max')) {
                    $table->integer('axel_4_max')->nullable();
                }
                if (!Schema::hasColumn('axelsetups', 'vehicle_max')) {
                    $table->integer('vehicle_max');
                }
                if (!Schema::hasColumn('axelsetups', 'company_id')) {
                    $table->foreignId('company_id')->constrained('companies'); // Assuming a 'companies' table exists
                }
                if (!Schema::hasColumn('axelsetups', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('axelsetups', 'deleted_at')) {
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
        if (Schema::hasTable('axelsetups')) {
            Schema::dropIfExists('axelsetups');
        }
    }
}
