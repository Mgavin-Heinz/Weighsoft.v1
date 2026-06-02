<?php

namespace App\Services;

use App\Models\BusinessPartner;
use App\Models\Company;
use App\Models\Product;
use App\Models\settings;
use App\Models\Site;
use App\Models\XeroSettings;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TicketPdfService
{
    public function generatePdf(string $weighingHeaderId): ?string
    {
        try {
            $header = DB::selectOne("
                SELECT wh.*, BIN_TO_UUID(wh.id, TRUE) as uuid_id
                FROM weighingheaders wh
                WHERE wh.id = UUID_TO_BIN(?, TRUE)
            ", [$weighingHeaderId]);

            if (!$header) {
                Log::warning("TicketPdfService: header not found for {$weighingHeaderId}");
                return null;
            }

            $company = Company::find($header->company_id);
            $bp = BusinessPartner::find($header->businesspartner_id);
            $product = Product::find($header->product_id);
            $setting = settings::find($header->settings_id);
            $site = Site::find($header->site_id);

            $measureType = $site->measure_type ?? 'kg';

            $xeroSettings = XeroSettings::where('company_id', $header->company_id)->first();
            $built = $this->buildAllLineItems($header, $product, $setting, $measureType, $xeroSettings);

            $html = $this->buildInvoiceHtml(
                $header,
                $company,
                $bp,
                $setting,
                $built['lines'],
                $built['totals']
            );

            $pdf = Pdf::loadHTML($html)->setPaper('a4', 'portrait');

            $path = storage_path('app/temp/invoice_' . ($header->transaction ?: $weighingHeaderId) . '.pdf');

            $dir = dirname($path);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }

            $pdf->save($path);

            return $path;
        } catch (\Exception $e) {
            Log::error("TicketPdfService failed: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Commercial lines and totals — keep in sync with XeroInvoiceService::buildLineItems and makeXeroLineItem.
     *
     * @return array{lines: list<array{code: string, desc: string, unitPrice: float, qty: float, symbol: string, total: float}>, totals: array{subTotal: float, vat: float, total: float, amountDue: float, balanceDue: float}}
     */
    private function buildAllLineItems(
        $header,
        ?Product $product,
        ?settings $setting,
        string $measureType,
        ?XeroSettings $xeroSettings
    ): array {
        $emptyTotals = ['subTotal' => 0.0, 'vat' => 0.0, 'total' => 0.0, 'amountDue' => 0.0, 'balanceDue' => 0.0];

        if (!$product) {
            return ['lines' => [], 'totals' => $emptyTotals];
        }

        $nettWeight = floatval($header->NettWeight ?? 0);
        $metricTons = WeighingNetToMetricTons::fromStoredNet($nettWeight, $measureType);
        $unitPrice = $this->resolveBaseUnitPriceForPdf($header, $product, $setting);
        $vatPct = floatval($product->vat ?? 0);

        $lines = [];

        $mainExcl = $unitPrice * $metricTons;
        $lines[] = [
            'code'      => $product->code ?? '',
            'desc'      => $product->name ?? '',
            'unitPrice' => $unitPrice,
            'qty'       => $nettWeight,
            'symbol'    => $measureType,
            'total'     => $mainExcl,
        ];

        $pkgRate = isset($header->contract_packaging_price_per_ton)
            ? floatval($header->contract_packaging_price_per_ton)
            : 0.0;
        if ($pkgRate > 0) {
            [$pkgCode, $pkgName] = $this->resolveAncillaryDisplay(
                $xeroSettings?->packaging_product_id,
                'Packaging (per ton)'
            );
            $lines[] = [
                'code'      => $pkgCode,
                'desc'      => $pkgName,
                'unitPrice' => $pkgRate,
                'qty'       => $metricTons,
                'symbol'    => 't',
                'total'     => $pkgRate * $metricTons,
            ];
        }

        $shipRate = isset($header->contract_shipping_price_per_ton)
            ? floatval($header->contract_shipping_price_per_ton)
            : 0.0;
        if ($shipRate > 0) {
            [$shipCode, $shipName] = $this->resolveAncillaryDisplay(
                $xeroSettings?->shipping_product_id,
                'Shipping (per ton)'
            );
            $lines[] = [
                'code'      => $shipCode,
                'desc'      => $shipName,
                'unitPrice' => $shipRate,
                'qty'       => $metricTons,
                'symbol'    => 't',
                'total'     => $shipRate * $metricTons,
            ];
        }

        $subTotal = 0.0;
        foreach ($lines as $line) {
            $subTotal += $line['total'];
        }

        $vat = 0.0;
        if ($vatPct > 0) {
            foreach ($lines as $line) {
                $vat += round(($line['total'] * $vatPct) / 100, 2);
            }
        }

        $total = $subTotal + $vat;

        return [
            'lines'  => $lines,
            'totals' => [
                'subTotal'   => $subTotal,
                'vat'        => $vat,
                'total'      => $total,
                'amountDue'  => $total,
                'balanceDue' => $total,
            ],
        ];
    }

    private function resolveBaseUnitPriceForPdf($header, Product $product, ?settings $weighbridgeSetting): float
    {
        $raw = $header->price ?? null;
        if ($raw !== null && trim((string) $raw) !== '') {
            return floatval($raw);
        }

        $goodsType = ($weighbridgeSetting !== null)
            ? ($weighbridgeSetting->goods_type ?? '0')
            : '0';

        return ($goodsType === '1')
            ? floatval($product->purchase_price ?? 0)
            : floatval($product->sale_price ?? 0);
    }

    /**
     * @return array{0: string, 1: string} [code, description]
     */
    private function resolveAncillaryDisplay(?int $productId, string $fallbackDesc): array
    {
        if (!$productId) {
            return ['', $fallbackDesc];
        }

        $ancillary = Product::find($productId);
        if (!$ancillary) {
            return ['', $fallbackDesc];
        }

        return [$ancillary->code ?? '', $ancillary->name ?? $fallbackDesc];
    }

    /**
     * Builds HTML that replicates invoice.tpl.html with embedded CSS from custom.css.
     *
     * @param list<array{code: string, desc: string, unitPrice: float, qty: float, symbol: string, total: float}> $lineItems
     */
    private function buildInvoiceHtml(
        $header,
        ?Company $company,
        ?BusinessPartner $bp,
        ?settings $setting,
        array $lineItems,
        array $totals
    ): string {
        $transaction = e($header->transaction ?? 'N/A');
        $todayDate = date('Y-m-d');

        // --- Company ---
        $companyName = e($company->registered_name ?? '');
        $companyStreet = e($company->street ?? '');
        $companySuburb = e($company->suburb1 ?? '');
        $companyCity = e($company->city1 ?? '');
        $companyPostal = e($company->postal_code1 ?? '');
        $companyPhone = e($company->cell ?: ($company->tel ?? ''));
        $companyVat = e($company->vat_nr ?? '');
        $companyTerms = e($company->terms ?? '');

        $logoHtml = '';
        if ($company && $company->display_custom_logo_img) {
            $logoHtml = '<img src="data:image/png;base64,' . $company->display_custom_logo_img . '" width="130" />';
        }

        // --- Business Partner ---
        $bpName = e($bp->name ?? '');
        $bpStreet = e($bp->street ?? '');
        $bpSuburb = e($bp->suburb ?? '');
        $bpCity = e($bp->city ?? '');
        $bpPostal = e($bp->postal_code ?? '');
        $bpVat = e($bp->vat_nr ?? '');

        // --- Amount Due ---
        $amountDue = 'R ' . $this->fmt($totals['amountDue']);

        // --- Line items ---
        $lineItemsHtml = '';
        foreach ($lineItems as $row) {
            $code = e($row['code']);
            $desc = e($row['desc']);
            $up = 'R ' . $this->fmtPrice($row['unitPrice']);
            $qty = $this->fmt($row['qty']) . ' ' . e($row['symbol']);
            $lineTotal = 'R ' . $this->fmt($row['total']);

            $lineItemsHtml .= "
                <tr class=\"item-row\">
                    <td class=\"item-name\"><div>{$code}</div></td>
                    <td class=\"description\"><div>{$desc}</div></td>
                    <td><div style=\"text-align:right;\">{$up}</div></td>
                    <td><div style=\"text-align:right;\">{$qty}</div></td>
                    <td><span style=\"text-align:right;\">{$lineTotal}</span></td>
                </tr>";
        }

        // --- Totals ---
        $subTotalHtml = 'R ' . $this->fmt($totals['subTotal']);
        $vatHtml = '';
        if ($totals['vat'] > 0) {
            $vatHtml = "
                <tr>
                    <td colspan=\"2\" class=\"blank\"></td>
                    <td colspan=\"2\" class=\"total-line\">VAT</td>
                    <td class=\"total-value\"><div>R {$this->fmt($totals['vat'])}</div></td>
                </tr>";
        }
        $totalHtml = 'R ' . $this->fmt($totals['total']);
        $balanceDueHtml = 'R ' . $this->fmt($totals['balanceDue']);

        // --- Contract snapshot: Stockpile Nr / Destination ---
        $stockpileDestinationHtml = '';
        $sn = trim((string) ($header->stockpile_nr ?? ''));
        $dest = trim((string) ($header->destination ?? ''));
        $ord = trim((string) ($header->order_numbers ?? ''));
        if ($sn !== '') {
            $stockpileDestinationHtml .= '<div style="width:48%;display:inline-block;vertical-align:top;"><p>Stockpile Nr: ' . e($sn) . '</p></div>';
        }
        if ($dest !== '') {
            $stockpileDestinationHtml .= '<div style="width:48%;display:inline-block;vertical-align:top;"><p>Destination: ' . e($dest) . '</p></div>';
        }
        if ($ord !== '') {
            $stockpileDestinationHtml .= '<div style="width:48%;display:inline-block;vertical-align:top;"><p>Order Numbers: ' . e($ord) . '</p></div>';
        }

        // --- Custom Fields (1-20) ---
        $customFieldsHtml = '';
        if ($setting) {
            for ($i = 1; $i <= 20; $i++) {
                $inputField = "user_defined_input{$i}";
                $nameField = "user_defined_name{$i}";
                $customKey = "Custom{$i}";

                $inputVal = $setting->$inputField ?? 'N';
                if ($inputVal !== 'N') {
                    $label = e($setting->$nameField ?? '');
                    $value = e($header->$customKey ?? '');
                    if ($label || $value) {
                        $customFieldsHtml .= "<div style=\"width:48%;display:inline-block;vertical-align:top;\"><p>{$label}: {$value}</p></div>";
                    }
                }
            }
        }

        // --- Terms ---
        $termsHtml = '';
        if ($companyTerms) {
            $termsHtml = "
                <div id=\"terms\">
                    <h5>Terms</h5>
                    <div>{$companyTerms}</div>
                </div>";
        }

        return <<<HTML
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; margin: 20px; color: #333; }

    #header {
        height: 15px; width: 100%; margin: 20px 0; background: #222;
        text-align: center; color: white; font: bold 15px Helvetica, Sans-Serif;
        text-decoration: uppercase; letter-spacing: 20px; padding: 8px 0px;
    }

    #address { width: 250px; height: 150px; float: left; }
    #customer { overflow: hidden; }
    #logo { text-align: right; float: right; position: relative; margin-top: 25px; border: 1px solid #fff; max-width: 540px; max-height: 100px; overflow: hidden; }
    #customer-title { font-size: 20px; float: left; }

    #meta { margin-top: 1px; width: 300px; float: right; }
    #meta td { text-align: right; }
    #meta td.meta-head { text-align: left; background: #eee; }

    table.invoice td, table.invoice th { border: 1px solid black; padding: 5px; text-align: right; }

    #items { clear: both; width: 100%; margin: 30px 0 0 0; border: 1px solid black; border-collapse: collapse; }
    #items th { background: #eee; padding: 5px; text-align: left; }
    #items td { padding: 4px 10px; }
    #items th.right { text-align: right; }
    #items tr.item-row td { border: 0; vertical-align: top; }
    #items td.description { width: 200px; }
    #items td.item-name { width: 100px; }
    #items td.total-line { border-right: 0; text-align: right; padding-top: 10px; }
    #items td.total-value { border-left: 0; text-align: right; padding-top: 10px; }
    #items td.balance { background: #eee; }
    #items td.blank { border: 0; }

    .due { font-weight: bold; }

    #terms { text-align: center; margin: 20px 0 0 0; }
    #terms h5 { text-transform: uppercase; font: 13px Helvetica, Sans-Serif; letter-spacing: 10px; border-bottom: 1px solid black; padding: 0 0 8px 0; margin: 0 0 8px 0; }

    .custom-fields { margin-top: 15px; }
    .custom-fields p { margin: 2px 0; font-size: 11px; }
</style>
</head>
<body>
    <div id="page-wrap">
        <div id="header">Ticket + {$transaction}</div>

        <div id="identity">
            <div id="address">
                {$companyName}<br/>
                {$companyStreet}<br/>
                {$companySuburb}<br/>
                {$companyCity}<br/>
                {$companyPostal}<br/>
                Phone: {$companyPhone}<br/>
                VAT No #{$companyVat}
            </div>
            <div id="logo">{$logoHtml}</div>
        </div>

        <div style="clear: both"></div>

        <div id="customer">
            <div id="customer-title">
                {$bpName}<br/>
                {$bpStreet}<br/>
                {$bpSuburb}<br/>
                {$bpCity}<br/>
                {$bpPostal}<br/>
                VAT No # {$bpVat}
            </div>
            <table class="invoice" id="meta">
                <tr>
                    <td class="meta-head">Invoice #</td>
                    <td><div>{$transaction}</div></td>
                </tr>
                <tr>
                    <td class="meta-head">Date</td>
                    <td><div id="date">{$todayDate}</div></td>
                </tr>
                <tr>
                    <td class="meta-head">Amount Due</td>
                    <td><div class="due">{$amountDue}</div></td>
                </tr>
            </table>
        </div>

        <table id="items">
            <tr>
                <th>Item</th>
                <th>Description</th>
                <th class="right">Unit Cost</th>
                <th class="right">Quantity</th>
                <th class="right">Price</th>
            </tr>
            {$lineItemsHtml}
            <tr>
                <td colspan="2" class="blank"></td>
                <td colspan="2" class="total-line">Subtotal</td>
                <td class="total-value"><div id="subtotal">{$subTotalHtml}</div></td>
            </tr>
            {$vatHtml}
            <tr>
                <td colspan="2" class="blank"></td>
                <td colspan="2" class="total-line">Total</td>
                <td class="total-value"><div id="paid">{$totalHtml}</div></td>
            </tr>
            <tr>
                <td colspan="2" class="blank"></td>
                <td colspan="2" class="total-line balance">Balance Due</td>
                <td class="total-value balance"><div class="due">{$balanceDueHtml}</div></td>
            </tr>
        </table>

        <br/>
        <div class="custom-fields">
            {$stockpileDestinationHtml}
            {$customFieldsHtml}
        </div>

        <br/>
        {$termsHtml}
    </div>
</body>
</html>
HTML;
    }

    private function fmt(float $value): string
    {
        return number_format($value, 2, '.', ' ');
    }

    /**
     * Matches frontend TwoOrFourDigits filter:
     * show 4 decimals if significant, otherwise 2.
     */
    private function fmtPrice(float $value): string
    {
        $decimals = (floor($value * 100) != floor($value * 10000)) ? 4 : 2;
        return number_format($value, $decimals, '.', ' ');
    }
}
