<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class CreateUuidFunctions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Create the BIN_TO_UUID function if it doesn't exist
        DB::unprepared('
            CREATE FUNCTION BIN_TO_UUID(binary_uuid BINARY(16))
            RETURNS CHAR(36) DETERMINISTIC
            BEGIN
                RETURN CONCAT(
                    HEX(SUBSTRING(binary_uuid, 1, 4)), "-", 
                    HEX(SUBSTRING(binary_uuid, 5, 2)), "-", 
                    HEX(SUBSTRING(binary_uuid, 7, 2)), "-", 
                    HEX(SUBSTRING(binary_uuid, 9, 2)), "-", 
                    HEX(SUBSTRING(binary_uuid, 11, 6))
                );
            END;
        ');

        // Create the UUID_TO_BIN function if it doesn't exist
        DB::unprepared('
            CREATE FUNCTION UUID_TO_BIN(uuid CHAR(36))
            RETURNS BINARY(16) DETERMINISTIC
            BEGIN
                RETURN UNHEX(REPLACE(uuid, "-", ""));
            END;
        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Drop the functions if they exist
        DB::unprepared('DROP FUNCTION IF EXISTS BIN_TO_UUID');
        DB::unprepared('DROP FUNCTION IF EXISTS UUID_TO_BIN');
    }
}
