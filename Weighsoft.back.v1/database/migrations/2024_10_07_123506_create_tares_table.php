<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTaresTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('tares')) {
            Schema::create('tares', function (Blueprint $table) {
                $table->id();
                $table->string('registration_no');
                $table->string('weight');
                $table->foreignId('company_id')->constrained()->onDelete('cascade');
                $table->foreignId('site_id')->constrained()->onDelete('cascade');
                $table->string('expiry_date');
                $table->foreignId('weighbridge_id')->constrained()->onDelete('cascade');
                $table->timestamps();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('tares', function (Blueprint $table) {
                if (!Schema::hasColumn('tares', 'registration_no')) {
                    $table->string('registration_no');
                }
                if (!Schema::hasColumn('tares', 'weight')) {
                    $table->string('weight');
                }
                if (!Schema::hasColumn('tares', 'company_id')) {
                    $table->foreignId('company_id')->constrained()->onDelete('cascade');
                }
                if (!Schema::hasColumn('tares', 'site_id')) {
                    $table->foreignId('site_id')->constrained()->onDelete('cascade');
                }
                if (!Schema::hasColumn('tares', 'expiry_date')) {
                    $table->string('expiry_date');
                }
                if (!Schema::hasColumn('tares', 'weighbridge_id')) {
                    $table->foreignId('weighbridge_id')->constrained()->onDelete('cascade');
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
        Schema::dropIfExists('tares');
    }
}
