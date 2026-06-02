<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReportingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('reporting')) {
            Schema::create('reporting', function (Blueprint $table) {
                $table->id();
                $table->string('name')->nullable();
                $table->string('description')->nullable();
                $table->string('jsondata', 4000)->nullable();
                $table->unsignedBigInteger('company_id')->nullable();
                $table->string('email')->nullable();
                $table->string('schedule', 20)->nullable();
                $table->dateTime('last_report_on')->nullable();
                $table->string('show_deleted')->nullable();
                $table->timestamps();
                $table->softDeletes();

                // Foreign key constraints
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            });
        } else {
            // Add columns if they do not exist
            Schema::table('reporting', function (Blueprint $table) {
                if (!Schema::hasColumn('reporting', 'name')) {
                    $table->string('name')->nullable();
                }
                if (!Schema::hasColumn('reporting', 'description')) {
                    $table->string('description')->nullable();
                }
                if (!Schema::hasColumn('reporting', 'jsondata')) {
                    $table->string('jsondata')->nullable();
                }
                if (!Schema::hasColumn('reporting', 'company_id')) {
                    $table->unsignedBigInteger('company_id')->nullable();
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('reporting', 'email')) {
                    $table->string('email')->nullable();
                }
                if (!Schema::hasColumn('reporting', 'schedule')) {
                    $table->string('schedule')->nullable();
                }
                if (!Schema::hasColumn('reporting', 'last_report_on')) {
                    $table->string('last_report_on')->nullable();
                }
                if (!Schema::hasColumn('reporting', 'show_deleted')) {
                    $table->string('show_deleted')->nullable();
                }
                if (!Schema::hasColumn('reporting', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('reporting', 'deleted_at')) {
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
        if (Schema::hasTable('reporting')) {
            Schema::dropIfExists('reporting');
        }
    }
}
