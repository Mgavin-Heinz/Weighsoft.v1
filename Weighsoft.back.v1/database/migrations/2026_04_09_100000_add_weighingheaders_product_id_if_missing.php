<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ensures weighingheaders.product_id exists for reporting (ReportPricingSqlHelper joins products on this column).
     * Idempotent: skips if the column is already present (e.g. from an older partial migration run).
     */
    public function up(): void
    {
        if (!Schema::hasTable('weighingheaders') || Schema::hasColumn('weighingheaders', 'product_id')) {
            return;
        }

        Schema::table('weighingheaders', function (Blueprint $table) {
            $table->unsignedBigInteger('product_id')->nullable()->after('businesspartner_id');
        });

        Schema::table('weighingheaders', function (Blueprint $table) {
            $table->index('product_id', 'weighingheaders_product_id_foreign');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('weighingheaders') || !Schema::hasColumn('weighingheaders', 'product_id')) {
            return;
        }

        Schema::table('weighingheaders', function (Blueprint $table) {
            $table->dropIndex('weighingheaders_product_id_foreign');
        });

        Schema::table('weighingheaders', function (Blueprint $table) {
            $table->dropColumn('product_id');
        });
    }
};
