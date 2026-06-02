<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSitesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('sites')) {
            Schema::create('sites', function (Blueprint $table) {
                $table->id();
                $table->string('site_type');
                $table->string('site_name');
                $table->string('finger_active')->nullable();
                $table->string('override_silo')->nullable();
                $table->string('site_active');
                $table->json('custom_header_text')->nullable();
                $table->json('custom_footer_text')->nullable();
                $table->foreignId('company_id')->constrained()->onDelete('cascade');
                $table->timestamps();
                $table->softDeletes();
                $table->string('measure_type')->nullable();
                $table->string('deduct_flow')->nullable();
                $table->integer('decimals')->nullable();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('sites', function (Blueprint $table) {
                if (!Schema::hasColumn('sites', 'site_type')) {
                    $table->string('site_type');
                }
                if (!Schema::hasColumn('sites', 'site_name')) {
                    $table->string('site_name');
                }
                if (!Schema::hasColumn('sites', 'finger_active')) {
                    $table->string('finger_active')->nullable();
                }
                if (!Schema::hasColumn('sites', 'override_silo')) {
                    $table->string('override_silo')->nullable();
                }
                if (!Schema::hasColumn('sites', 'site_active')) {
                    $table->string('site_active');
                }
                if (!Schema::hasColumn('sites', 'custom_header_text')) {
                    $table->json('custom_header_text')->nullable();
                }
                if (!Schema::hasColumn('sites', 'custom_footer_text')) {
                    $table->json('custom_footer_text')->nullable();
                }
                if (!Schema::hasColumn('sites', 'company_id')) {
                    $table->foreignId('company_id')->constrained()->onDelete('cascade');
                }
                if (!Schema::hasColumn('sites', 'measure_type')) {
                    $table->string('measure_type')->nullable();
                }
                if (!Schema::hasColumn('sites', 'deduct_flow')) {
                    $table->string('deduct_flow')->nullable();
                }
                if (!Schema::hasColumn('sites', 'decimals')) {
                    $table->integer('decimals')->nullable();
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
        Schema::dropIfExists('sites');
    }
}
