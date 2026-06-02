<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\settings;
use App\Models\XeroSettings;
use App\Services\TicketPdfService;
use ReflectionClass;
use ReflectionMethod;
use Tests\TestCase;

class TicketPdfServiceLineItemsTest extends TestCase
{
    public function test_build_all_line_items_includes_packaging_shipping_and_totals(): void
    {
        $header = (object) [
            'NettWeight'                       => 10000,
            'price'                            => '1',
            'contract_packaging_price_per_ton' => 2,
            'contract_shipping_price_per_ton'  => 3,
        ];

        $product = new Product([
            'code'        => 'AAA',
            'name'        => 'Weighsoft Xero Test',
            'vat'         => 15,
            'sale_price'  => 99,
            'company_id'  => 1,
        ]);

        $setting = new settings(['goods_type' => '0']);
        $xeroSettings = new XeroSettings(['packaging_product_id' => null, 'shipping_product_id' => null]);

        $svc = new TicketPdfService();
        $ref = new ReflectionClass(TicketPdfService::class);
        $m = $ref->getMethod('buildAllLineItems');
        $m->setAccessible(true);

        /** @var array{lines: list<mixed>, totals: array<string, float>} $result */
        $result = $m->invoke($svc, $header, $product, $setting, 'kg', $xeroSettings);

        $this->assertCount(3, $result['lines']);
        $this->assertSame('Packaging (per ton)', $result['lines'][1]['desc']);
        $this->assertSame('Shipping (per ton)', $result['lines'][2]['desc']);
        $this->assertEqualsWithDelta(10.0, $result['lines'][0]['total'], 0.001);
        $this->assertEqualsWithDelta(20.0, $result['lines'][1]['total'], 0.001);
        $this->assertEqualsWithDelta(30.0, $result['lines'][2]['total'], 0.001);
        $this->assertEqualsWithDelta(60.0, $result['totals']['subTotal'], 0.001);
        $this->assertEqualsWithDelta(9.0, $result['totals']['vat'], 0.001);
        $this->assertEqualsWithDelta(69.0, $result['totals']['total'], 0.001);
    }

    public function test_resolve_base_unit_price_prefers_header_price_snapshot(): void
    {
        $header = (object) [
            'NettWeight' => 1000,
            'price'      => '5.5',
        ];

        $product = new Product([
            'purchase_price' => 1,
            'sale_price'     => 2,
            'vat'            => 0,
            'company_id'     => 1,
        ]);

        $setting = new settings(['goods_type' => '0']);

        $svc = new TicketPdfService();
        $ref = new ReflectionClass(TicketPdfService::class);
        $m = $ref->getMethod('resolveBaseUnitPriceForPdf');
        $m->setAccessible(true);

        $price = $m->invoke($svc, $header, $product, $setting);
        $this->assertEqualsWithDelta(5.5, $price, 0.0001);
    }
}
