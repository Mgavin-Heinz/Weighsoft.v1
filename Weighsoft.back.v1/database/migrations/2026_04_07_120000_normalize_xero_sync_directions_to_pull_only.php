<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // xero_settings table does not exist in this installation — skip silently.
        if (!Schema::hasTable('xero_settings')) {
            return;
        }
    }

    public function down(): void {}
};