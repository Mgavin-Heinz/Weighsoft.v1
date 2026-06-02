<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('firstname');
                $table->string('lastname');
                $table->string('contact_num');
                $table->string('email')->unique();
                $table->string('password');
                $table->foreignId('role_id')->nullable()->constrained()->onDelete('set null');
                $table->foreignId('site_id')->nullable()->constrained()->onDelete('set null');
                $table->foreignId('workstations_id')->nullable()->constrained()->onDelete('set null');
                $table->foreignId('company_id')->nullable()->constrained()->onDelete('set null');
                $table->string('token')->nullable();
                $table->string('fingerprint');
                $table->softDeletes(); // For the deleted_at column
                $table->timestamps();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'firstname')) {
                    $table->string('firstname');
                }
                if (!Schema::hasColumn('users', 'lastname')) {
                    $table->string('lastname');
                }
                if (!Schema::hasColumn('users', 'contact_num')) {
                    $table->string('contact_num');
                }
                if (!Schema::hasColumn('users', 'email')) {
                    $table->string('email')->unique();
                }
                if (!Schema::hasColumn('users', 'password')) {
                    $table->string('password');
                }
                if (!Schema::hasColumn('users', 'role_id')) {
                    $table->foreignId('role_id')->nullable()->constrained()->onDelete('set null');
                }
                if (!Schema::hasColumn('users', 'site_id')) {
                    $table->foreignId('site_id')->nullable()->constrained()->onDelete('set null');
                }
                if (!Schema::hasColumn('users', 'workstations_id')) {
                    $table->foreignId('workstations_id')->nullable()->constrained()->onDelete('set null');
                }
                if (!Schema::hasColumn('users', 'company_id')) {
                    $table->foreignId('company_id')->nullable()->constrained()->onDelete('set null');
                }
                if (!Schema::hasColumn('users', 'token')) {
                    $table->string('token')->nullable();
                }
                if (!Schema::hasColumn('users', 'fingerprint')) {
                    $table->string('fingerprint');
                }
                if (!Schema::hasColumn('users', 'deleted_at')) {
                    $table->softDeletes(); // Add soft deletes column if not exists
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
        Schema::dropIfExists('users');
    }
}
