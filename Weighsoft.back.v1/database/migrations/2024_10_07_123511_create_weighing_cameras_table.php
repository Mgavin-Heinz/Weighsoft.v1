<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeighingCamerasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('weighingcameras')) {
            Schema::create('weighingcameras', function (Blueprint $table) {
                $table->id();
                $table->string('base64');
                $table->string('isnpr');
                $table->unsignedBigInteger('weighing_transaction_id');
                $table->unsignedBigInteger('site_id');
                $table->unsignedBigInteger('company_id');
                $table->timestamps();
                $table->softDeletes(); // Enables soft deletes
            });
        } else {
            // Add columns if they do not exist
            Schema::table('weighingcameras', function (Blueprint $table) {
                if (!Schema::hasColumn('weighingcameras', 'base64')) {
                    $table->string('base64');
                }
                if (!Schema::hasColumn('weighingcameras', 'isnpr')) {
                    $table->string('isnpr');
                }
                if (!Schema::hasColumn('weighingcameras', 'weighing_transaction_id')) {
                    $table->unsignedBigInteger('weighing_transaction_id');
                }
                if (!Schema::hasColumn('weighingcameras', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                }
                if (!Schema::hasColumn('weighingcameras', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
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
        Schema::dropIfExists('weighingcameras');
    }
}
