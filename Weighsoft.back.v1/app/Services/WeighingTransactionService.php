<?php


namespace App\Services;


use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WeighingTransactionService
{
    public function createWeighingTransaction($weighingTransaction) {
        $insertSql = "
            INSERT INTO
                weighingtransactions (
                    id,
                    Status,
                    Weight1,
                    Weight2,
                    Weight3,
                    Weight4,
                    Weight5,
                    Weight6,
                    WeightTotal,
                    weighing_header_id,
                    site_id,
                    workstation_id,
                    company_id,
                    created_at,
                    updated_at,
                    AxelSetups
                )
            VALUES (
                UUID_TO_BIN(UUID(), true),
                :status,
                :weight1,
                :weight2,
                :weight3,
                :weight4,
                :weight5,
                :weight6,
                :weightTotal,
                UUID_TO_BIN(:weighingHeaderId, true),
                :siteId,
                :workstationId,
                :companyId,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP,
                :axelSetups
            );
        ";

        $insertParameters = [
            "status" => $weighingTransaction['Status'],
            "weight1" => $weighingTransaction['Weight1'] ?? 0,
            "weight2" => $weighingTransaction['Weight2'] ?? 0,
            "weight3" => $weighingTransaction['Weight3'] ?? 0,
            "weight4" => $weighingTransaction['Weight4'] ?? 0,
            "weight5" => $weighingTransaction['Weight5'] ?? 0,
            "weight6" => $weighingTransaction['Weight6'] ?? 0,
            "weightTotal" => $weighingTransaction['WeightTotal'] ?? 0,
            "weighingHeaderId" => $weighingTransaction['weighing_header_id'],
            "siteId" => $weighingTransaction['site_id'],
            "workstationId" => $weighingTransaction['workstation_id'],
            "companyId" => $weighingTransaction['company_id'],
            "axelSetups" => 0
        ];

        DB::insert($insertSql, $insertParameters);

        $selectSql = "
            SELECT
                BIN_TO_UUID(id, true) AS id,
                Status,
                Weight1,
                Weight2,
                Weight3,
                Weight4,
                Weight5,
                Weight6,
                WeightTotal,
                BIN_TO_UUID(weighing_header_id, TRUE) AS weighing_header_id,
                site_id,
                workstation_id,
                company_id,
                updated_at,
                created_at,
                AxelSetups
            FROM
                weighingtransactions
            ORDER BY updated_at DESC
            LIMIT 1;
        ";

        return DB::select($selectSql)[0];
    }

    public function deleteWeighingTransaction(string $id): int
    {
        $sql = "
            DELETE FROM
                weighingtransactions
            WHERE
                id = UUID_TO_BIN(?, TRUE);
        ";

        return DB::delete($sql, [$id]);
    }
}
