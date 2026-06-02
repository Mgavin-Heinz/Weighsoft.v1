<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBusinessPartnersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('businesspartners')) {
            Schema::create('businesspartners', function (Blueprint $table) {
                $table->id();
                $table->string('code');
                $table->string('name');
                $table->string('vat_nr')->nullable();
                $table->string('street')->nullable();
                $table->string('suburb')->nullable();
                $table->string('city')->nullable();
                $table->string('postal_code')->nullable();
                $table->foreignId('site_id')->constrained('sites');  // Assuming a 'sites' table exists
                $table->foreignId('company_id')->constrained('companies');  // Assuming a 'companies' table exists
                $table->timestamps();
                $table->softDeletes();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('businesspartners', function (Blueprint $table) {
                if (!Schema::hasColumn('businesspartners', 'code')) {
                    $table->string('code');
                }
                if (!Schema::hasColumn('businesspartners', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('businesspartners', 'vat_nr')) {
                    $table->string('vat_nr')->nullable();
                }
                if (!Schema::hasColumn('businesspartners', 'street')) {
                    $table->string('street')->nullable();
                }
                if (!Schema::hasColumn('businesspartners', 'suburb')) {
                    $table->string('suburb')->nullable();
                }
                if (!Schema::hasColumn('businesspartners', 'city')) {
                    $table->string('city')->nullable();
                }
                if (!Schema::hasColumn('businesspartners', 'postal_code')) {
                    $table->string('postal_code')->nullable();
                }
                if (!Schema::hasColumn('businesspartners', 'site_id')) {
                    $table->foreignId('site_id')->constrained('sites');  // Assuming a 'sites' table exists
                }
                if (!Schema::hasColumn('businesspartners', 'company_id')) {
                    $table->foreignId('company_id')->constrained('companies');  // Assuming a 'companies' table exists
                }
                if (!Schema::hasColumn('businesspartners', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('businesspartners', 'deleted_at')) {
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
        if (Schema::hasTable('businesspartners')) {
            Schema::dropIfExists('businesspartners');
        }
    }
}
