<?php

namespace App\Http\Controllers;

use App\Models\BusinessPartner;
use App\Models\Contracts;
use App\Models\Product;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ContractsController extends JwtAuthController
{
    private Contracts $model;

    public function __construct() {
        parent::__construct();
        $this->model = new Contracts();
    }
    public static function LoadData($companyId, $siteId)
    {
        $query = new Contracts();
        if ($companyId != "") {
            $query = $query->where('company_id', '=', $companyId);
        }
        if ($siteId != "") {
            $query = $query->where('site_id', '=', $siteId);
        }
        
        $data = $query->withCount('transactions')->get();
        
        $products = (new Product())
            ->whereIn('id', array_unique(array_map(fn($item) => $item['product_id'], $data->toArray())))
            ->get(['id', 'name']);
        $productDict = array();
        foreach ($products as $product) {
            $productDict[$product->id] = $product->name;
        }

        $businessPartners = (new BusinessPartner())
            ->whereIn('id', array_unique(array_map(fn($item) => $item['businesspartner_id'], $data->toArray())))
            ->get(['id', 'name']);
        $businessPartnerDict = array();
        foreach ($businessPartners as $businessPartner) {
            $businessPartnerDict[$businessPartner->id] = $businessPartner->name;
        }

        foreach ($data as $contract) {
            if (isset($productDict[$contract->product_id])) {
                $contract->product = $productDict[$contract->product_id];
            }

            if (isset($businessPartnerDict[$contract->businesspartner_id])) {
                $contract->businesspartner = $businessPartnerDict[$contract->businesspartner_id];
            }
        }

        return $data->map(function ($contract) {
            $contract->has_transaction = ((int) $contract->transactions_count) > 0;
            $contract->makeHidden(['transactions_count']);

            return $contract;
        })->values();
    }
    public function index(): JsonResponse
    {
        $companyId = "";
        $siteId = "";
        if (isset($_GET) && isset($_GET['company_id'])) {
            $companyId = $_GET['company_id'];
        }
        if (isset($_GET) && isset($_GET['site_id'])) {
            $siteId = $_GET['site_id'];
        }
        $data = $this->LoadData($companyId, $siteId);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $item = self::normalizeContractPayload($request->all());
        self::validateContractPricingOrFail($item);
        Log::info(print_r($item, true));

        $item = $this->model->create($item);
        return response()->json($item);
    }

    public function show(int $id): JsonResponse
    {
        $item = $this->model->find($id);
        if (!$item) {
            return $this->error("Contract not found", 404);
        }

        return response()->json($item);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $item = $this->model->find($id);
        if (!$item) {
            return $this->error("Contract not found", 404);
        }
        $payload = self::normalizeContractPayload($request->all());
        self::validateContractPricingOrFail($payload);
        $item->update($payload);
        return response()->json($item);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private static function normalizeContractPayload(array $data): array
    {
        $expiry = $data['expiry_date'] ?? null;
        if ($expiry === null || $expiry === '') {
            $data['expiry_date'] = null;
        } else {
            $expiryStr = is_string($expiry) ? $expiry : (string) $expiry;
            $ts = strtotime($expiryStr);
            $data['expiry_date'] = $ts !== false ? date('Y-m-d H:i:s', $ts) : null;
        }

        $price = $data['price'] ?? null;
        if ($price === null || $price === '' || (is_string($price) && trim($price) === '')) {
            $data['price'] = null;
        }

        $data['packaging_enabled'] = (($data['packaging_enabled'] ?? '') === 'true') ? 'true' : 'false';
        $data['shipping_enabled'] = (($data['shipping_enabled'] ?? '') === 'true') ? 'true' : 'false';

        if ($data['packaging_enabled'] !== 'true') {
            $data['packaging_price_per_ton'] = null;
        } else {
            $data['packaging_price_per_ton'] = self::normalizeOptionalDecimal($data['packaging_price_per_ton'] ?? null);
        }

        if ($data['shipping_enabled'] !== 'true') {
            $data['shipping_price_per_ton'] = null;
        } else {
            $data['shipping_price_per_ton'] = self::normalizeOptionalDecimal($data['shipping_price_per_ton'] ?? null);
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private static function validateContractPricingOrFail(array $data): void
    {
        $rules = [
            'price' => 'required|numeric',
        ];
        if (($data['packaging_enabled'] ?? '') === 'true') {
            $rules['packaging_price_per_ton'] = 'required|numeric';
        }
        if (($data['shipping_enabled'] ?? '') === 'true') {
            $rules['shipping_price_per_ton'] = 'required|numeric';
        }
        Validator::make($data, $rules, [
            'price.required' => 'Contract price is required.',
            'price.numeric' => 'Contract price must be a number.',
            'packaging_price_per_ton.required' => 'Packaging price per ton is required when packaging is enabled.',
            'shipping_price_per_ton.required' => 'Shipping price per ton is required when shipping is enabled.',
        ])->validate();
    }

    private static function normalizeOptionalDecimal(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        if (is_string($value) && trim($value) === '') {
            return null;
        }
        if (!is_numeric($value)) {
            return null;
        }

        return (string) $value;
    }

    public function destroy(int $id): JsonResponse
    {
        $item = $this->model->find($id);
        if (!$item) {
            return $this->error("Contract not found", 404);
        }
        $item->delete();
        return response()->json($item);
    }

    public function deleteWithReason(Request $request, int $id): JsonResponse
    {
        try {
            $contract = $this->model->findOrFail($id);
            $contract->update(['reason' => $request->all()['reason']]);
            $contract->delete();
            return response()->json(['status' => true]);
        } catch (Exception){
            return $this->error('Contract not found', 404);
        }
    }
}
