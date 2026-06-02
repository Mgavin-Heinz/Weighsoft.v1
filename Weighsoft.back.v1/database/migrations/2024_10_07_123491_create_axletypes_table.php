<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAxleTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('axletypes')) {
            Schema::create('axletypes', function (Blueprint $table) {
                $table->id();
                $table->integer('Single_Steering');
                $table->integer('Double_Steering');
                $table->integer('Triple_Steering');
                $table->integer('Single_Non_Steering');
                $table->integer('Double_Non_Steering');
                $table->integer('Triple_Non_Steering');
                $table->integer('Double_Single_Non_Steering');
                $table->integer('Double_Double_Non_Steering');
                $table->integer('Double_Triple_Non_Steering');
                $table->integer('Custom_1');
                $table->integer('Custom_2');
                $table->integer('Custom_3');
                $table->foreignId('company_id')->constrained('companies'); // Assuming a 'companies' table exists
                $table->timestamps();
                $table->softDeletes();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('axletypes', function (Blueprint $table) {
                if (!Schema::hasColumn('axletypes', 'Single_Steering')) {
                    $table->integer('Single_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Double_Steering')) {
                    $table->integer('Double_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Triple_Steering')) {
                    $table->integer('Triple_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Single_Non_Steering')) {
                    $table->integer('Single_Non_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Double_Non_Steering')) {
                    $table->integer('Double_Non_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Triple_Non_Steering')) {
                    $table->integer('Triple_Non_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Double_Single_Non_Steering')) {
                    $table->integer('Double_Single_Non_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Double_Double_Non_Steering')) {
                    $table->integer('Double_Double_Non_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Double_Triple_Non_Steering')) {
                    $table->integer('Double_Triple_Non_Steering');
                }
                if (!Schema::hasColumn('axletypes', 'Custom_1')) {
                    $table->integer('Custom_1');
                }
                if (!Schema::hasColumn('axletypes', 'Custom_2')) {
                    $table->integer('Custom_2');
                }
                if (!Schema::hasColumn('axletypes', 'Custom_3')) {
                    $table->integer('Custom_3');
                }
                if (!Schema::hasColumn('axletypes', 'company_id')) {
                    $table->foreignId('company_id')->constrained('companies'); // Assuming a 'companies' table exists
                }
                if (!Schema::hasColumn('axletypes', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('axletypes', 'deleted_at')) {
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
        if (Schema::hasTable('axletypes')) {
            Schema::dropIfExists('axletypes');
        }
    }
}
