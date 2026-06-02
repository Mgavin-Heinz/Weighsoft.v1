<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('weighingcameras', function (Blueprint $table) {
            $table->string('print_camera')->default('true')->after('company_id');
        });
    }

    public function down()
    {
        Schema::table('weighingcameras', function (Blueprint $table) {
            $table->dropColumn('print_camera');
        });
    }
};
