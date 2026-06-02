<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHauliersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('hauliers')) {
            Schema::create('hauliers', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->unsignedBigInteger('site_id');
                $table->unsignedBigInteger('company_id');
                $table->timestamps();
                $table->softDeletes();

                // Foreign key constraints
                $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            });
        } else {
            // Add columns if they do not exist
            Schema::table('hauliers', function (Blueprint $table) {
                if (!Schema::hasColumn('hauliers', 'code')) {
                    $table->string('code')->unique();
                }
                if (!Schema::hasColumn('hauliers', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('hauliers', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                    $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                }
                if (!Schema::hasColumn('hauliers', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('hauliers', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('hauliers', 'deleted_at')) {
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
        if (Schema::hasTable('hauliers')) {
            Schema::dropIfExists('hauliers');
        }
    }
}
