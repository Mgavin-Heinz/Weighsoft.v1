<?php


namespace App\Services;


use App\Models\weighingCameras;
use Illuminate\Support\Facades\DB;

class WeighingCameraService
{
    public function insertWeighingCamera($weighingCamera)
    {
        $insertSql = "INSERT INTO
            weighingcameras (id, base64, isnpr, weighing_transaction_id, site_id, company_id, print_camera, updated_at, created_at)
        VALUES (
            UUID_TO_BIN(UUID(), true),
            ?, ?, UUID_TO_BIN(?, true), ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )";

        $params = [
            $weighingCamera["base64"],
            $weighingCamera["isnpr"],
            $weighingCamera["weighing_transaction_id"],
            $weighingCamera["site_id"],
            $weighingCamera["company_id"],
            $weighingCamera["print_camera"] ?? 'true',
        ];

        DB::insert($insertSql, $params);

        $selectSql = "
            SELECT
                BIN_TO_UUID(id, true) as id,
                base64,
                isnpr,
                BIN_TO_UUID(weighing_transaction_id, true) as weighing_transaction_id,
                site_id,
                company_id,
                print_camera,
                updated_at,
                created_at
            FROM weighingcameras
            ORDER BY created_at desc
            LIMIT 1
        ";

        return DB::select($selectSql)[0];
    }

    public function getByWeighingTransaction($transactionId) {
        $selectSql = "
            SELECT
                BIN_TO_UUID(id, true) as id,
                base64,
                isnpr,
                BIN_TO_UUID(weighing_transaction_id, true) as weighing_transaction_id,
                site_id,
                company_id,
                print_camera,
                created_at,
                updated_at
            FROM
                 weighingcameras
            WHERE
                weighing_transaction_id = UUID_TO_BIN(?, true)
        ";

        return DB::select($selectSql, [$transactionId]);
    }
}
