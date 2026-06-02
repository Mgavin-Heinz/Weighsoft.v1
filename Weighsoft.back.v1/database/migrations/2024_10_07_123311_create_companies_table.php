<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('companies')) {
            Schema::create('companies', function (Blueprint $table) {
                $table->id();
                $table->string('code');
                $table->string('registered_name');
                $table->string('tel');
                $table->string('fax')->nullable();
                $table->string('email');
                $table->string('registration_number');
                $table->string('vat_nr');
                $table->string('contact_person');
                $table->string('cell');
                $table->string('street');
                $table->string('suburb1');
                $table->string('city1');
                $table->string('postal_code1');
                $table->string('po_box')->nullable();
                $table->string('suburb2')->nullable();
                $table->string('city2')->nullable();
                $table->string('postal_code2')->nullable();
                $table->text('terms')->nullable();
                $table->binary('display_custom_logo_img')->nullable();  // Blob for the logo image
                $table->timestamps();
                $table->softDeletes();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('companies', function (Blueprint $table) {
                if (!Schema::hasColumn('companies', 'code')) {
                    $table->string('code');
                }
                if (!Schema::hasColumn('companies', 'registered_name')) {
                    $table->string('registered_name');
                }
                if (!Schema::hasColumn('companies', 'tel')) {
                    $table->string('tel');
                }
                if (!Schema::hasColumn('companies', 'fax')) {
                    $table->string('fax')->nullable();
                }
                if (!Schema::hasColumn('companies', 'email')) {
                    $table->string('email');
                }
                if (!Schema::hasColumn('companies', 'registration_number')) {
                    $table->string('registration_number');
                }
                if (!Schema::hasColumn('companies', 'vat_nr')) {
                    $table->string('vat_nr');
                }
                if (!Schema::hasColumn('companies', 'contact_person')) {
                    $table->string('contact_person');
                }
                if (!Schema::hasColumn('companies', 'cell')) {
                    $table->string('cell');
                }
                if (!Schema::hasColumn('companies', 'street')) {
                    $table->string('street');
                }
                if (!Schema::hasColumn('companies', 'suburb1')) {
                    $table->string('suburb1');
                }
                if (!Schema::hasColumn('companies', 'city1')) {
                    $table->string('city1');
                }
                if (!Schema::hasColumn('companies', 'postal_code1')) {
                    $table->string('postal_code1');
                }
                if (!Schema::hasColumn('companies', 'po_box')) {
                    $table->string('po_box')->nullable();
                }
                if (!Schema::hasColumn('companies', 'suburb2')) {
                    $table->string('suburb2')->nullable();
                }
                if (!Schema::hasColumn('companies', 'city2')) {
                    $table->string('city2')->nullable();
                }
                if (!Schema::hasColumn('companies', 'postal_code2')) {
                    $table->string('postal_code2')->nullable();
                }
                if (!Schema::hasColumn('companies', 'terms')) {
                    $table->text('terms')->nullable();
                }
                if (!Schema::hasColumn('companies', 'display_custom_logo_img')) {
                    $table->binary('display_custom_logo_img')->nullable();  // Blob for the logo image
                }
                if (!Schema::hasColumn('companies', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('companies', 'deleted_at')) {
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
        if (Schema::hasTable('companies')) {
            Schema::dropIfExists('companies');
        }
    }
}
