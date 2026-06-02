<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTicketTemplateToSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('settings', 'ticket_template')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->string('ticket_template')->default('normal')->after('print_ticket');
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
        if (Schema::hasColumn('settings', 'ticket_template')) {
            Schema::table('settings', function (Blueprint $table) {
                $table->dropColumn('ticket_template');
            });
        }
    }
}
