<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddScaleEndpointToWorkstationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('workstations', function (Blueprint $table) {
            if (!Schema::hasColumn('workstations', 'scale_endpoint')) {
                $table->string('scale_endpoint')->nullable()->after('workstation_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('workstations', function (Blueprint $table) {
            if (Schema::hasColumn('workstations', 'scale_endpoint')) {
                $table->dropColumn('scale_endpoint');
            }
        });
    }
}
