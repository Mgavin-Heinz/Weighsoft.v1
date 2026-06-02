<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->id();
                $table->string('code');
                $table->string('name');
                $table->string('vat')->nullable();
                $table->unsignedBigInteger('company_id');
                $table->string('purchase_price')->nullable();
                $table->string('sale_price')->nullable();
                $table->string('grades_enabled')->nullable();
                $table->string('grades')->nullable();
                $table->timestamps();
                $table->softDeletes();

                // Foreign key constraints
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            });
        } else {
            // Add columns if they do not exist
            Schema::table('products', function (Blueprint $table) {
                if (!Schema::hasColumn('products', 'code')) {
                    $table->string('code');
                }
                if (!Schema::hasColumn('products', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('products', 'vat')) {
                    $table->string('vat')->nullable();
                }
                if (!Schema::hasColumn('products', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('products', 'purchase_price')) {
                    $table->string('purchase_price')->nullable();
                }
                if (!Schema::hasColumn('products', 'sale_price')) {
                    $table->string('sale_price')->nullable();
                }
                if (!Schema::hasColumn('products', 'grades_enabled')) {
                    $table->string('grades_enabled')->nullable();
                }
                if (!Schema::hasColumn('products', 'grades')) {
                    $table->string('grades')->nullable();
                }
                if (!Schema::hasColumn('products', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('products', 'deleted_at')) {
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
        if (Schema::hasTable('products')) {
            Schema::dropIfExists('products');
        }
    }
}
