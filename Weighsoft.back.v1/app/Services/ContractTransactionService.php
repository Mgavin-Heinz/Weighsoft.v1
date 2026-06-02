<?php


namespace App\Services;


use App\Models\ContractTransactions;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ContractTransactionService
{
    private ContractTransactions $model;

    public function __construct() {
        $this->model = new ContractTransactions();
    }

    public function insertItem($contractTransaction) {



        $time = date("Y-m-d H:i:s", time());

        $sql = "
            INSERT INTO
                contract_transactions (id, contract_id, amount, weighing_header_id, site_id, updated_at, created_at, company_id)
            VALUES
                (UUID_TO_BIN(UUID(), true), ?, ?, UUID_TO_BIN(?, TRUE), ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
        ";

        $params = array(
            $contractTransaction['contract_id'],
            $contractTransaction['contract_amount'], // was FirstWeight
            $contractTransaction['weighing_header_id'],
            $contractTransaction['site_id'],
            $contractTransaction['company_id']
        );

        try {
            // Execute the SQL insert
            DB::insert($sql, $params);
        } catch (\Exception $e) {
            // Log the error message, SQL query, and parameters for debugging
            Log::error('Error inserting contract transaction: ' . $e->getMessage());
            Log::error('SQL Query: ' . $sql);
            Log::error('Parameters: ' . json_encode($params));
    
            // Re-throw the exception to handle it further up the stack if needed
            throw $e;
        }

        return $this->getLastInserted();
    }

    public function getOne(string $id): Model|ContractTransactions|null
    {
        $transaction = $this->model
            ->whereRaw("id = UUID_TO_BIN(?, TRUE)", $id)
            ->first(["contract_transactions.*", DB::raw("UUID_TO_BIN(id, TRUE) as id2. UUID_TO_BIN(weighing_header_id, TRUE) as weighing_header_id2")]);

        if (!empty($transaction)) {
            $transaction['id'] = $transaction['id2'];
            $transaction['weighing_header_id'] = $transaction['weighing_header_id2'];

            unset($transaction['id2']);
            unset($transaction['weighing_header_id2']);
        }

        return $transaction;
    }

    public function getLastInserted()
    {
        $sql = "
            SELECT
                BIN_TO_UUID(id, TRUE) as id,
                contract_id,
                amount,
                BIN_TO_UUID(weighing_header_id, TRUE) as weighing_header_id,
                site_id,
                updated_at,
                created_at,
                company_id
            FROM
                contract_transactions
            ORDER BY updated_at
            LIMIT 1;
        ";

        return DB::select($sql)[0];
    }

    public function updateItem(string $id, $item): int
    {
        $sql = "
            update
                contract_transactions
            set
                contract_id = ?,
                amount = ?,
                weighing_header_id = UUID_TO_BIN(?, TRUE),
                site_id = ?,
                updated_at = ?,
                company_id = ?
            where
                id = UUID_TO_BIN(?, TRUE)
        ";

        $params = array(
            $item['contract_id'],
            $item['amount'],
            $item['weighing_header_id'],
            $item['site_id'],
            date("Y-m-d H:i:s"),
            $item['company_id']
        );

        return DB::update($sql, $params);
    }

    public function deleteItem(string $id): int
    {
        $sql = "
            update
                contract_transactions
            set
                deleted_at = ?
            where
                id = UUID_TO_BIN(?, TRUE)
        ";

        $params = array(
            date("Y-m-d H:i:s"),
            $id
        );

        return DB::update($sql, $params);
    }

}
