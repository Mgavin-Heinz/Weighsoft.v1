<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('firstname');
                $table->string('lastname');
                $table->string('contact_num');
                $table->string('email')->unique();
                $table->string('password');
                // role_id references a 'roles' table that does not exist —
                // stored as a plain nullable integer instead.
                $table->unsignedBigInteger('role_id')->nullable();
                $table->unsignedBigInteger('site_id')->nullable();
                $table->unsignedBigInteger('workstations_id')->nullable();
                $table->unsignedBigInteger('company_id')->nullable();
                $table->string('token')->nullable();
                $table->string('fingerprint');
                $table->softDeletes();
                $table->timestamps();

                $table->foreign('site_id')->references('id')->on('sites')->onDelete('set null');
                $table->foreign('workstations_id')->references('id')->on('workstations')->onDelete('set null');
                $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
            });
        } else {
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
                    $table->unsignedBigInteger('role_id')->nullable();
                }
                if (!Schema::hasColumn('users', 'site_id')) {
                    $table->unsignedBigInteger('site_id')->nullable();
                    $table->foreign('site_id')->references('id')->on('sites')->onDelete('set null');
                }
                if (!Schema::hasColumn('users', 'workstations_id')) {
                    $table->unsignedBigInteger('workstations_id')->nullable();
                    $table->foreign('workstations_id')->references('id')->on('workstations')->onDelete('set null');
                }
                if (!Schema::hasColumn('users', 'company_id')) {
                    $table->unsignedBigInteger('company_id')->nullable();
                    $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
                }
                if (!Schema::hasColumn('users', 'token')) {
                    $table->string('token')->nullable();
                }
                if (!Schema::hasColumn('users', 'fingerprint')) {
                    $table->string('fingerprint');
                }
                if (!Schema::hasColumn('users', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}