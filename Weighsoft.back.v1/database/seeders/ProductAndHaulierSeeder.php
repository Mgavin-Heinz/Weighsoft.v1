<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Task 12 — Demo seed data for products and hauliers.
 * Run after CompanySeeder.
 * Run with:  php artisan db:seed --class=ProductAndHaulierSeeder
 */
class ProductAndHaulierSeeder extends Seeder
{
    public function run(): void
    {
        $ivm = DB::table('companies')->where('code', 'IVM')->value('id');
        $cag = DB::table('companies')->where('code', 'CAG')->value('id');
        $hgc = DB::table('companies')->where('code', 'HGC')->value('id');

        $ivmSite = DB::table('sites')->where('company_id', $ivm)->value('id');
        $cagSite = DB::table('sites')->where('company_id', $cag)->value('id');
        $hgcSite = DB::table('sites')->where('company_id', $hgc)->value('id');

        // ── Products ──────────────────────────────────────────────────────────

        DB::table('products')->insertOrIgnore([
            // Ironveld Mining
            ['code' => 'IVM-ORE', 'name' => 'Iron Ore',          'company_id' => $ivm, 'vat' => '15', 'purchase_price' => '850.00',  'sale_price' => '1200.00', 'grades_enabled' => '1', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'IVM-SLG', 'name' => 'Slag',              'company_id' => $ivm, 'vat' => '15', 'purchase_price' => '120.00',  'sale_price' => '200.00',  'grades_enabled' => '0', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'IVM-VRM', 'name' => 'Vanadium Residue',  'company_id' => $ivm, 'vat' => '15', 'purchase_price' => '2100.00', 'sale_price' => '3500.00', 'grades_enabled' => '1', 'created_at' => now(), 'updated_at' => now()],

            // Coastal Aggregates
            ['code' => 'CAG-G19', 'name' => '19mm Crusher Stone', 'company_id' => $cag, 'vat' => '15', 'purchase_price' => '95.00',  'sale_price' => '145.00', 'grades_enabled' => '0', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAG-G13', 'name' => '13mm Crusher Stone', 'company_id' => $cag, 'vat' => '15', 'purchase_price' => '100.00', 'sale_price' => '155.00', 'grades_enabled' => '0', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAG-SND', 'name' => 'Building Sand',      'company_id' => $cag, 'vat' => '15', 'purchase_price' => '60.00',  'sale_price' => '95.00',  'grades_enabled' => '0', 'created_at' => now(), 'updated_at' => now()],

            // Highveld Grain
            ['code' => 'HGC-MAZ', 'name' => 'Maize (White)',     'company_id' => $hgc, 'vat' => '0',  'purchase_price' => '3200.00', 'sale_price' => '3800.00', 'grades_enabled' => '1', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'HGC-SUN', 'name' => 'Sunflower Seed',    'company_id' => $hgc, 'vat' => '0',  'purchase_price' => '7100.00', 'sale_price' => '7900.00', 'grades_enabled' => '1', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'HGC-SOY', 'name' => 'Soybean',           'company_id' => $hgc, 'vat' => '0',  'purchase_price' => '6400.00', 'sale_price' => '7200.00', 'grades_enabled' => '1', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── Hauliers ──────────────────────────────────────────────────────────

        DB::table('hauliers')->insertOrIgnore([
            // Ironveld Mining
            ['code' => 'IVM-H01', 'name' => 'Limpopo Heavy Haulage',     'company_id' => $ivm, 'site_id' => $ivmSite, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'IVM-H02', 'name' => 'Joburg Freight Solutions',  'company_id' => $ivm, 'site_id' => $ivmSite, 'created_at' => now(), 'updated_at' => now()],

            // Coastal Aggregates
            ['code' => 'CAG-H01', 'name' => 'Durban Bulk Transport',     'company_id' => $cag, 'site_id' => $cagSite, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'CAG-H02', 'name' => 'KZN Logistics cc',          'company_id' => $cag, 'site_id' => $cagSite, 'created_at' => now(), 'updated_at' => now()],

            // Highveld Grain
            ['code' => 'HGC-H01', 'name' => 'NW Grain Carriers',         'company_id' => $hgc, 'site_id' => $hgcSite, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'HGC-H02', 'name' => 'Vaal Transport (Pty) Ltd',  'company_id' => $hgc, 'site_id' => $hgcSite, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
