<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE xero_settings MODIFY COLUMN sync_customers VARCHAR(40) NOT NULL DEFAULT 'xero_to_weighsoft'");
            DB::statement("ALTER TABLE xero_settings MODIFY COLUMN sync_products VARCHAR(40) NOT NULL DEFAULT 'xero_to_weighsoft'");
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE xero_settings MODIFY COLUMN sync_customers VARCHAR(20) NOT NULL DEFAULT 'xero_to_weighsoft'");
            DB::statement("ALTER TABLE xero_settings MODIFY COLUMN sync_products VARCHAR(20) NOT NULL DEFAULT 'xero_to_weighsoft'");
        }
    }
};
