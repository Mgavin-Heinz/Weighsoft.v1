<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Task 12 — Demo seed data for sites.
 * Run after CompanySeeder.
 * Run with:  php artisan db:seed --class=SiteSeeder
 */
class SiteSeeder extends Seeder
{
    public function run(): void
    {
        $ivm = DB::table('companies')->where('code', 'IVM')->value('id');
        $cag = DB::table('companies')->where('code', 'CAG')->value('id');
        $hgc = DB::table('companies')->where('code', 'HGC')->value('id');

        DB::table('sites')->insertOrIgnore([
            [
                'site_type'           => 'weighbridge',
                'site_name'           => 'Ironveld — Johannesburg Main Gate',
                'site_active'         => '1',
                'finger_active'       => '0',
                'override_silo'       => '0',
                'shared_workstation'  => false,
                'custom_header_text'  => 'Ironveld Mining (Pty) Ltd',
                'custom_footer_text'  => 'Thank you for your business.',
                'company_id'          => $ivm,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'site_type'           => 'weighbridge',
                'site_name'           => 'Coastal Aggregates — Pinetown Quarry',
                'site_active'         => '1',
                'finger_active'       => '0',
                'override_silo'       => '0',
                'shared_workstation'  => false,
                'custom_header_text'  => 'Coastal Aggregates (Pty) Ltd',
                'custom_footer_text'  => 'All weights certified by SABS-approved scale.',
                'company_id'          => $cag,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'site_type'           => 'silo',
                'site_name'           => 'Highveld Grain — Klerksdorp Silos',
                'site_active'         => '1',
                'finger_active'       => '0',
                'override_silo'       => '1',
                'shared_workstation'  => false,
                'custom_header_text'  => 'Highveld Grain Co-operative Ltd',
                'custom_footer_text'  => 'Member of Grain SA.',
                'company_id'          => $hgc,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
        ]);
    }
}
