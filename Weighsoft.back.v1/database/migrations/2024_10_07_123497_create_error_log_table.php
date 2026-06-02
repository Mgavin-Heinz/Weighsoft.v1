<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateErrorlogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('errorlog')) {
            Schema::create('errorlog', function (Blueprint $table) {
                $table->id();
                $table->string('code');
                $table->text('description');
                $table->json('jsondata');
                $table->text('comment')->nullable();
                $table->unsignedBigInteger('weighbridge_id');
                $table->unsignedBigInteger('workstation_id');
                $table->unsignedBigInteger('site_id');
                $table->unsignedBigInteger('company_id');
                $table->timestamps();

                // Foreign key constraints
                $table->foreign('weighbridge_id')->references('id')->on('weighbridges')->onDelete('cascade');
                $table->foreign('workstation_id')->references('id')->on('workstations')->onDelete('cascade');
                $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            });
        } else {
            // Add columns if they do not exist
            Schema::table('errorlog', function (Blueprint $table) {
                if (!Schema::hasColumn('errorlog', 'code')) {
                    $table->string('code');
                }
                if (!Schema::hasColumn('errorlog', 'description')) {
                    $table->text('description');
                }
                if (!Schema::hasColumn('errorlog', 'jsondata')) {
                    $table->json('jsondata');
                }
                if (!Schema::hasColumn('errorlog', 'comment')) {
                    $table->text('comment')->nullable();
                }
                if (!Schema::hasColumn('errorlog', 'weighbridge_id')) {
                    $table->unsignedBigInteger('weighbridge_id');
                    $table->foreign('weighbridge_id')->references('id')->on('weighbridges')->onDelete('cascade');
                }
                if (!Schema::hasColumn('errorlog', 'workstation_id')) {
                    $table->unsignedBigInteger('workstation_id');
                    $table->foreign('workstation_id')->references('id')->on('workstations')->onDelete('cascade');
                }
                if (!Schema::hasColumn('errorlog', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                    $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                }
                if (!Schema::hasColumn('errorlog', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('errorlog', 'created_at')) {
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
        if (Schema::hasTable('errorlog')) {
            Schema::dropIfExists('errorlog');
        }
    }
}
