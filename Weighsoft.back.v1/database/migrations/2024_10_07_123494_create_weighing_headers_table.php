<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeighingHeadersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('weighingheaders')) {
            Schema::create('weighingheaders', function (Blueprint $table) {
                $table->string('id')->primary(); // Using string as the key type, set as primary key
                $table->string('transaction')->nullable();
                $table->unsignedBigInteger('settings_id')->nullable();
                $table->string('RegNumber')->nullable();
                $table->string('RegNumber2')->nullable();
                $table->string('RegNumber3')->nullable();
                $table->string('Custom1')->nullable();
                $table->string('Custom2')->nullable();
                $table->string('Custom3')->nullable();
                $table->string('Custom4')->nullable();
                $table->string('Custom5')->nullable();
                $table->string('Custom6')->nullable();
                $table->string('Custom7')->nullable();
                $table->string('Custom8')->nullable();
                $table->string('Custom9')->nullable();
                $table->string('Custom10')->nullable();
                $table->string('Custom11')->nullable();
                $table->string('Custom12')->nullable();
                $table->string('Custom13')->nullable();
                $table->string('Custom14')->nullable();
                $table->string('Custom15')->nullable();
                $table->string('Custom16')->nullable();
                $table->string('Custom17')->nullable();
                $table->string('Custom18')->nullable();
                $table->string('Custom19')->nullable();
                $table->string('Custom20')->nullable();
                $table->float('FirstWeight')->nullable();
                $table->float('SecondWeight')->nullable();
                $table->float('TotalWeight')->nullable();
                $table->integer('NettWeight')->nullable();
                $table->unsignedBigInteger('businesspartner_id')->nullable();
                $table->unsignedBigInteger('product_id')->nullable();
                $table->unsignedBigInteger('grade_id')->nullable();
                $table->string('grades')->nullable();
                $table->unsignedBigInteger('haulier_id')->nullable();
                $table->unsignedBigInteger('weighbridge_id');
                $table->unsignedBigInteger('site_id');
                $table->unsignedBigInteger('company_id');
                $table->string('reason')->default('')->nullable();
                $table->string('status')->default('')->nullable();
                $table->string('price')->nullable();
                $table->string('moisture_deduction')->nullable();
                $table->string('handling_charges')->nullable();
                $table->unsignedBigInteger('pallet_id')->nullable();
                $table->string('pallet_charges')->nullable();
                $table->integer('pallet_count')->nullable();
                $table->unsignedBigInteger('tare_id')->nullable();
                $table->unsignedBigInteger('firstWeightUserId');
                $table->unsignedBigInteger('secondWeightUserId')->nullable();
                $table->unsignedBigInteger('verifyUserId')->nullable();
                $table->unsignedBigInteger('deletedUserId')->nullable();
                $table->unsignedBigInteger('workstation_id');
                $table->float('moisture_threshold')->nullable();
                $table->float('moistureCoefficient')->nullable();
                $table->float('moistureWeight')->nullable();
                $table->float('handlingWeight')->nullable();
                $table->timestamps();
                $table->softDeletes(); // Enables soft deletes
            });
        } else {
            // Add columns if they do not exist
            Schema::table('weighingheaders', function (Blueprint $table) {
                if (!Schema::hasColumn('weighingheaders', 'transaction')) {
                    $table->string('transaction')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'settings_id')) {
                    $table->unsignedBigInteger('settings_id')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'RegNumber')) {
                    $table->string('RegNumber')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'RegNumber2')) {
                    $table->string('RegNumber2')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'RegNumber3')) {
                    $table->string('RegNumber3')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'Custom1')) {
                    $table->string('Custom1')->nullable();
                }
                // Repeat for Custom2 to Custom20...
                if (!Schema::hasColumn('weighingheaders', 'FirstWeight')) {
                    $table->float('FirstWeight')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'SecondWeight')) {
                    $table->float('SecondWeight')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'TotalWeight')) {
                    $table->float('TotalWeight')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'NettWeight')) {
                    $table->integer('NettWeight')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'businesspartner_id')) {
                    $table->unsignedBigInteger('businesspartner_id')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'product_id')) {
                    $table->unsignedBigInteger('product_id')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'grade_id')) {
                    $table->unsignedBigInteger('grade_id')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'grades')) {
                    $table->string('grades')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'haulier_id')) {
                    $table->unsignedBigInteger('haulier_id')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'weighbridge_id')) {
                    $table->unsignedBigInteger('weighbridge_id');
                }
                if (!Schema::hasColumn('weighingheaders', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                }
                if (!Schema::hasColumn('weighingheaders', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                }
                if (!Schema::hasColumn('weighingheaders', 'reason')) {
                    $table->string('reason')->default('')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'status')) {
                    $table->string('status')->default('')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'price')) {
                    $table->string('price')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'moisture_deduction')) {
                    $table->string('moisture_deduction')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'handling_charges')) {
                    $table->string('handling_charges')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'pallet_id')) {
                    $table->unsignedBigInteger('pallet_id')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'pallet_charges')) {
                    $table->string('pallet_charges')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'pallet_count')) {
                    $table->integer('pallet_count')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'tare_id')) {
                    $table->unsignedBigInteger('tare_id')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'firstWeightUserId')) {
                    $table->unsignedBigInteger('firstWeightUserId');
                }
                if (!Schema::hasColumn('weighingheaders', 'secondWeightUserId')) {
                    $table->unsignedBigInteger('secondWeightUserId')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'verifyUserId')) {
                    $table->unsignedBigInteger('verifyUserId')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'deletedUserId')) {
                    $table->unsignedBigInteger('deletedUserId')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'workstation_id')) {
                    $table->unsignedBigInteger('workstation_id');
                }
                if (!Schema::hasColumn('weighingheaders', 'moisture_threshold')) {
                    $table->float('moisture_threshold')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'moistureCoefficient')) {
                    $table->float('moistureCoefficient')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'moistureWeight')) {
                    $table->float('moistureWeight')->nullable();
                }
                if (!Schema::hasColumn('weighingheaders', 'handlingWeight')) {
                    $table->float('handlingWeight')->nullable();
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
        Schema::dropIfExists('weighingheaders');
    }
}
