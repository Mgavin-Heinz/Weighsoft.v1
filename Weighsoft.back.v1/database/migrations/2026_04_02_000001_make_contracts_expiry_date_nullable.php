<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class MakeContractsExpiryDateNullable extends Migration
{
    /**
     * Run the migrations.
     * Uses raw SQL to avoid requiring doctrine/dbal for column changes.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE contracts MODIFY expiry_date DATE NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE contracts MODIFY expiry_date DATE NOT NULL');
        }
    }
}
