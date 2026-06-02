<?php


namespace App\Services;


use App\Models\weighingHeaders;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WeighingHeaderService
{
    private function isSharedWorkstationEnabled($siteId): bool
    {
        if (empty($siteId)) {
            return false;
        }

        $sharedWorkstation = DB::table('sites')
            ->where('id', $siteId)
            ->value('shared_workstation');

        return strcasecmp((string)$sharedWorkstation, 'Yes') === 0;
    }

    public function getWeighingHeaders($companyId, $siteId, $workstationId, $status, $pageStart, $pageSize, $orderByCol, $orderByDir, $searchTerm): array
    {
        $columns = array("1234", "transaction", "updated_at", "settings", "RegNumber", "weighbridge", "product", "businesspartner");
        $sqlStatement = "
            SELECT
                `transaction`,
                BIN_TO_UUID(id, TRUE) AS id,
                wh.company_id,
                wh.site_id,
                wh.workstation_id,
                (SELECT `name` FROM settings WHERE settings.id = wh.settings_id) settings,
                RegNumber,
                status,
                SecondWeight,
                TotalWeight,
                (SELECT `name` FROM weighbridges WHERE weighbridges.id = wh.weighbridge_id) weighbridge,
                (SELECT `name` FROM products WHERE products.id = wh.product_id) product,
                (SELECT `name` FROM businesspartners WHERE businesspartners.id = wh.businesspartner_id and businesspartners.site_id = wh.site_id) businesspartner,
                (SELECT `site_name` FROM sites WHERE sites.id = wh.site_id) site,
                updated_at,
                created_at,
                FirstWeight,
                xero_invoice_id,
                xero_invoice_status,
                xero_invoice_status_updated_at,
                invoice_modified
            FROM
                 weighingheaders wh";

        $filters = array("deleted_at IS NULL");
        $parameters = array();
        if (isset($searchTerm) && !empty($searchTerm)) {
            array_push($filters, "(`transaction` LIKE ? OR `RegNumber` LIKE ?)");
            array_push($parameters, "%$searchTerm%", "%$searchTerm%");
        }

        if (isset($companyId) && !empty($companyId)) {
            array_push($filters, "company_id = ?");
            array_push($parameters, $companyId);
        }

        if (isset($siteId) && !empty($siteId)) {
            array_push($filters, "site_id = ?");
            array_push($parameters, $siteId);
        }

        if (isset($workstationId) && !empty($workstationId) && !$this->isSharedWorkstationEnabled($siteId)) {
            array_push($filters, "workstation_id = ?");
            array_push($parameters, $workstationId);
        }

        if (isset($status) && !empty($status)) {
            array_push($filters, "status <> ?");
            array_push($parameters, $status);
        }

        $filterParameters = $parameters;

        $whereStatement = " WHERE " . implode(" AND ", $filters);
        $sqlStatement .= $whereStatement;

        $key = array_search($orderByCol, $columns);
        if ($key != false) {
            $sqlStatement .= " ORDER BY $columns[$key] $orderByDir";
        }

        $sqlStatement .= " LIMIT ?";
        $sqlStatement .= " OFFSET ?";
        array_push($parameters, $pageSize, $pageStart);

        $data = DB::select($sqlStatement, $parameters);

        $countSql = "select count(1) as count from weighingheaders" . $whereStatement;

        $count = DB::selectOne($countSql, $filterParameters);

        return [$data, $count->count];
    }

    public function getOneWeighingHeader($id): Model|weighingHeaders|null
    {
        $weighingHeader = (new weighingHeaders)
            ->whereRaw("id = UUID_TO_BIN(?, TRUE)", [$id])
            ->first(["weighingheaders.*", DB::raw("BIN_TO_UUID(id, TRUE) as id2")]);

        if (!empty($weighingHeader)) {
            $weighingHeader['id'] = $weighingHeader['id2'];
            unset($weighingHeader['id2']);
        }

        return $weighingHeader;
    }

    public function getLastUpdatedItem()
    {
        $sql = "
            SELECT
                weighingheaders.*,
                BIN_TO_UUID(id, TRUE) as id2
            FROM
                weighingheaders
            ORDER BY updated_at DESC
            LIMIT 1;
        ";

        $weighingHeader = DB::select($sql)[0];

        if (!empty($weighingHeader)) {
            $weighingHeader->id = $weighingHeader->id2;
            unset($weighingHeader->id2);
        }

        return $weighingHeader;
    }

    public function insertWeighingHeader($weighingHeader)
    {
        $sql = "
                insert into
                    weighingheaders (
                        id,
                        transaction,
                        settings_id,
                        RegNumber,
                        RegNumber2,
                        RegNumber3,
                        Custom1,
                        Custom2,
                        Custom3,
                        Custom4,
                        Custom5,
                        Custom6,
                        Custom7,
                        Custom8,
                        Custom9,
                        Custom10,
                        FirstWeight,
                        SecondWeight,
                        TotalWeight,
                        NettWeight,
                        businesspartner_id,
                        product_id,
                        grade_id,
                        grades,
                        haulier_id,
                        weighbridge_id,
                        site_id,
                        company_id,
                        updated_at,
                        created_at,
                        Custom11,
                        Custom12,
                        Custom13,
                        Custom14,
                        Custom15,
                        Custom16,
                        Custom17,
                        Custom18,
                        Custom19,
                        Custom20,
                        reason,
                        status,
                        moisture_deduction,
                        handling_charges,
                        pallet_id,
                        pallet_count,
                        pallet_charges,
                        tare_id,
                        firstWeightUserId,
                        secondWeightUserId,
                        verifyUserId,
                        deletedUserId,
                        workstation_id,
                        moisture_threshold,
                        moistureCoefficient,
                        moistureWeight,
                        handlingWeight,
                        stockpile_nr,
                        destination,
                        order_numbers,
                        price,
                        contract_packaging_price_per_ton,
                        contract_shipping_price_per_ton
                    )
                values
                    (UUID_TO_BIN(UUID(), true), ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,?,?,?,?, ?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?)
            ";

            $params = [
                $weighingHeader['transaction'],
                $weighingHeader['settings_id'],
                $weighingHeader['RegNumber'] ?? null,
                $weighingHeader['RegNumber2'] ?? null,
                $weighingHeader['RegNumber3'] ?? null,
                $weighingHeader['Custom1'] ?? null,
                $weighingHeader['Custom2'] ?? null,
                $weighingHeader['Custom3'] ?? null,
                $weighingHeader['Custom4'] ?? null,
                $weighingHeader['Custom5'] ?? null,
                $weighingHeader['Custom6'] ?? null,
                $weighingHeader['Custom7'] ?? null,
                $weighingHeader['Custom8'] ?? null,
                $weighingHeader['Custom9'] ?? null,
                $weighingHeader['Custom10'] ?? null,
                $weighingHeader['FirstWeight'] ?? null,
                $weighingHeader['SecondWeight'] ?? null,
                $weighingHeader['TotalWeight'] ?? null,
                $weighingHeader['NettWeight'] ?? null,
                $weighingHeader['businesspartner_id'] ?? null,
                $weighingHeader['product_id'] ?? null,
                $weighingHeader['grade_id'] ?? null,
                $weighingHeader['grades'] ?? null,
                $weighingHeader['haulier_id'] ?? null,
                $weighingHeader['weighbridge_id'],
                $weighingHeader['site_id'],
                $weighingHeader['company_id'],
                $weighingHeader['Custom11'] ?? null,
                $weighingHeader['Custom12'] ?? null,
                $weighingHeader['Custom13'] ?? null,
                $weighingHeader['Custom14'] ?? null,
                $weighingHeader['Custom15'] ?? null,
                $weighingHeader['Custom16'] ?? null,
                $weighingHeader['Custom17'] ?? null,
                $weighingHeader['Custom18'] ?? null,
                $weighingHeader['Custom19'] ?? null,
                $weighingHeader['Custom20'] ?? null,
                $weighingHeader['reason'] ?? '',  // Correctly added placeholder
                $weighingHeader['status'],
                $weighingHeader['moisture_deduction'] ?? 0,
                $weighingHeader['handling_charges'] ?? 0,
                $weighingHeader['pallet_id'] ?? null,
                $weighingHeader['pallet_count'] ?? null,
                $weighingHeader['pallet_charges'] ?? 0,
                $weighingHeader['tare_id'] ?? null,
                $weighingHeader['firstWeightUserId'],
                $weighingHeader['secondWeightUserId'] ?? null,
                $weighingHeader['verifyUserId'] ?? null,
                $weighingHeader['deletedUserId'] ?? null,
                $weighingHeader['workstation_id'],
                $weighingHeader['moisture_threshold'] ?? null,
                $weighingHeader['moistureCoefficient'] ?? 0,
                $weighingHeader['moistureWeight'] ?? 0,
                $weighingHeader['handlingWeight'] ?? 0,
                $weighingHeader['stockpile_nr'] ?? null,
                $weighingHeader['destination'] ?? null,
                $weighingHeader['order_numbers'] ?? null,
                $weighingHeader['price'] ?? null,
                $weighingHeader['contract_packaging_price_per_ton'] ?? null,
                $weighingHeader['contract_shipping_price_per_ton'] ?? null
            ];

        DB::insert($sql, $params);

        return $this->getLastUpdatedItem();
    }

    public function updateWeighingHeader($id, $weighingHeader): int
    {
        // Build dynamic SQL to only update fields that are explicitly provided
        $setParts = [];
        $parameters = [];
        
        // Always update these core fields
        if (isset($weighingHeader['settings_id'])) {
            $setParts[] = "settings_id = ?";
            $parameters[] = $weighingHeader['settings_id'];
        }
        if (isset($weighingHeader['FirstWeight'])) {
            $setParts[] = "FirstWeight = ?";
            $parameters[] = $weighingHeader['FirstWeight'];
        }
        if (isset($weighingHeader['SecondWeight'])) {
            $setParts[] = "SecondWeight = ?";
            $parameters[] = $weighingHeader['SecondWeight'];
        }
        if (isset($weighingHeader['TotalWeight'])) {
            $setParts[] = "TotalWeight = ?";
            $parameters[] = $weighingHeader['TotalWeight'];
        }
        if (isset($weighingHeader['NettWeight'])) {
            $setParts[] = "NettWeight = ?";
            $parameters[] = $weighingHeader['NettWeight'];
        }
        if (isset($weighingHeader['status'])) {
            $setParts[] = "status = ?";
            $parameters[] = $weighingHeader['status'];
        }
        
        // Only update these fields if they are explicitly provided (preserve existing values)
        $preserveFields = [
            'RegNumber', 'RegNumber2', 'RegNumber3',
            'Custom1', 'Custom2', 'Custom3', 'Custom4', 'Custom5', 
            'Custom6', 'Custom7', 'Custom8', 'Custom9', 'Custom10',
            'Custom11', 'Custom12', 'Custom13', 'Custom14', 'Custom15',
            'Custom16', 'Custom17', 'Custom18', 'Custom19', 'Custom20',
            'businesspartner_id', 'product_id', 'grade_id', 'grades', 'haulier_id',
            'price', 'moisture_deduction', 'handling_charges',
            'pallet_id', 'pallet_charges', 'pallet_count', 'tare_id',
            'firstWeightUserId', 'secondWeightUserId', 'verifyUserId',
            'moistureCoefficient', 'moistureWeight', 'handlingWeight',
            'stockpile_nr', 'destination', 'order_numbers',
            'contract_packaging_price_per_ton', 'contract_shipping_price_per_ton',
            'xero_invoice_status', 'xero_invoice_status_updated_at', 'invoice_modified'
        ];
        
        foreach ($preserveFields as $field) {
            if (array_key_exists($field, $weighingHeader)) {
                $setParts[] = "$field = ?";
                $parameters[] = $weighingHeader[$field];
            }
        }
        
        // Always update timestamp
        $setParts[] = "updated_at = CURRENT_TIMESTAMP";
        
        if (empty($setParts)) {
            // Nothing to update
            return 0;
        }
        
        $sql = "
            UPDATE weighingheaders
            SET " . implode(", ", $setParts) . "
            WHERE id = UUID_TO_BIN(?, TRUE)
        ";
        
        // Add ID parameter at the end
        $parameters[] = $id;

        return DB::update($sql, $parameters);
    }

    public function deleteWeighingHeader($id, $userId, $reason = null): int
    {
        $sql = "
            UPDATE
                weighingheaders
            SET
                reason = ?,
                deleted_at = ?,
                deletedUserId = ?
            WHERE
                id = UUID_TO_BIN(?, TRUE)
        ";

        return DB::update($sql, [$reason, date("Y-m-d H:i:s", time()), $userId, $id]);
    }
}
