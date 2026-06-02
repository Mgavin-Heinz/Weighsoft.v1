<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExceptionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('exceptions')) {
            Schema::create('exceptions', function (Blueprint $table) {
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
            Schema::table('exceptions', function (Blueprint $table) {
                if (!Schema::hasColumn('exceptions', 'code')) {
                    $table->string('code');
                }
                if (!Schema::hasColumn('exceptions', 'description')) {
                    $table->text('description');
                }
                if (!Schema::hasColumn('exceptions', 'jsondata')) {
                    $table->json('jsondata');
                }
                if (!Schema::hasColumn('exceptions', 'comment')) {
                    $table->text('comment')->nullable();
                }
                if (!Schema::hasColumn('exceptions', 'weighbridge_id')) {
                    $table->unsignedBigInteger('weighbridge_id');
                    $table->foreign('weighbridge_id')->references('id')->on('weighbridges')->onDelete('cascade');
                }
                if (!Schema::hasColumn('exceptions', 'workstation_id')) {
                    $table->unsignedBigInteger('workstation_id');
                    $table->foreign('workstation_id')->references('id')->on('workstations')->onDelete('cascade');
                }
                if (!Schema::hasColumn('exceptions', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                    $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                }
                if (!Schema::hasColumn('exceptions', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('exceptions', 'created_at')) {
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
        if (Schema::hasTable('exceptions')) {
            Schema::dropIfExists('exceptions');
        }
    }
}
