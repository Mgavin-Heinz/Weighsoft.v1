<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContractsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('contracts')) {
            Schema::create('contracts', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->unsignedBigInteger('businesspartner_id');
                $table->date('expiry_date');
                $table->string('direction');
                $table->decimal('price', 15, 2)->nullable();
                $table->decimal('amount', 15, 2);
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('site_id');
                $table->unsignedBigInteger('company_id');
                $table->text('reason')->nullable();
                $table->unsignedBigInteger('linked_contact_id')->nullable();
                $table->timestamps();
                $table->softDeletes();

                // Foreign key constraints
                $table->foreign('businesspartner_id')->references('id')->on('businesspartners')->onDelete('cascade');
                $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                $table->foreign('linked_contact_id')->references('id')->on('contracts')->onDelete('set null');
            });
        } else {
            // Add columns if they do not exist
            Schema::table('contracts', function (Blueprint $table) {
                if (!Schema::hasColumn('contracts', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('contracts', 'businesspartner_id')) {
                    $table->unsignedBigInteger('businesspartner_id');
                    $table->foreign('businesspartner_id')->references('id')->on('businesspartners')->onDelete('cascade');
                }
                if (!Schema::hasColumn('contracts', 'expiry_date')) {
                    $table->date('expiry_date');
                }
                if (!Schema::hasColumn('contracts', 'direction')) {
                    $table->string('direction');
                }
                if (!Schema::hasColumn('contracts', 'price')) {
                    $table->decimal('price', 15, 2)->nullable();
                }
                if (!Schema::hasColumn('contracts', 'amount')) {
                    $table->decimal('amount', 15, 2);
                }
                if (!Schema::hasColumn('contracts', 'product_id')) {
                    $table->unsignedBigInteger('product_id');
                    $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                }
                if (!Schema::hasColumn('contracts', 'site_id')) {
                    $table->unsignedBigInteger('site_id');
                    $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
                }
                if (!Schema::hasColumn('contracts', 'company_id')) {
                    $table->unsignedBigInteger('company_id');
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
                }
                if (!Schema::hasColumn('contracts', 'reason')) {
                    $table->text('reason')->nullable();
                }
                if (!Schema::hasColumn('contracts', 'linked_contact_id')) {
                    $table->unsignedBigInteger('linked_contact_id')->nullable();
                    $table->foreign('linked_contact_id')->references('id')->on('contracts')->onDelete('set null');
                }
                if (!Schema::hasColumn('contracts', 'created_at')) {
                    $table->timestamps();
                }
                if (!Schema::hasColumn('contracts', 'deleted_at')) {
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
        if (Schema::hasTable('contracts')) {
            Schema::dropIfExists('contracts');
        }
    }
}
