<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Task 12 — Demo seed data for companies.
 *
 * Three fictional South African companies covering different use cases:
 *  - Ironveld Mining       : large multi-site mining operation
 *  - Coastal Aggregates    : medium-sized construction materials supplier
 *  - Highveld Grain Co-op  : agricultural cooperative, single site
 *
 * Run with:  php artisan db:seed --class=CompanySeeder
 */
class CompanySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('companies')->insertOrIgnore([
            [
                'code'                => 'IVM',
                'registered_name'     => 'Ironveld Mining (Pty) Ltd',
                'tel'                 => '+27 11 234 5600',
                'fax'                 => '+27 11 234 5601',
                'email'               => 'admin@ironveld.co.za',
                'registration_number' => '2005/034821/07',
                'vat_nr'              => '4560123456',
                'contact_person'      => 'Thabo Nkosi',
                'cell'                => '+27 82 456 7890',
                'street'              => '14 Minerals Drive',
                'suburb1'             => 'Northcliff',
                'city1'               => 'Johannesburg',
                'postal_code1'        => '2115',
                'po_box'              => 'P.O. Box 1140',
                'suburb2'             => 'Northcliff',
                'city2'               => 'Johannesburg',
                'postal_code2'        => '2116',
                'terms'               => 'Payment due within 30 days of invoice date.',
                'display_custom_logo_img' => null,
                'smart_hauliers'      => true,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'code'                => 'CAG',
                'registered_name'     => 'Coastal Aggregates (Pty) Ltd',
                'tel'                 => '+27 31 765 4300',
                'fax'                 => null,
                'email'               => 'info@coastalagg.co.za',
                'registration_number' => '2011/098432/07',
                'vat_nr'              => '4871029384',
                'contact_person'      => 'Priya Naidoo',
                'cell'                => '+27 83 321 0987',
                'street'              => '88 Quarry Road',
                'suburb1'             => 'Pinetown',
                'city1'               => 'Durban',
                'postal_code1'        => '3610',
                'po_box'              => null,
                'suburb2'             => null,
                'city2'               => null,
                'postal_code2'        => null,
                'terms'               => 'Payment due within 14 days. Late payments attract 2% monthly interest.',
                'display_custom_logo_img' => null,
                'smart_hauliers'      => false,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
            [
                'code'                => 'HGC',
                'registered_name'     => 'Highveld Grain Co-operative Ltd',
                'tel'                 => '+27 18 293 4400',
                'fax'                 => '+27 18 293 4401',
                'email'               => 'ops@highveldgrain.co.za',
                'registration_number' => '1998/007654/06',
                'vat_nr'              => '4120983712',
                'contact_person'      => 'Johan van der Merwe',
                'cell'                => '+27 72 100 2233',
                'street'              => '3 Silos Road',
                'suburb1'             => 'Klerksdorp',
                'city1'               => 'Klerksdorp',
                'postal_code1'        => '2570',
                'po_box'              => 'P.O. Box 55',
                'suburb2'             => null,
                'city2'               => null,
                'postal_code2'        => null,
                'terms'               => 'COD unless prior credit arrangement in place.',
                'display_custom_logo_img' => null,
                'smart_hauliers'      => false,
                'created_at'          => now(),
                'updated_at'          => now(),
            ],
        ]);
    }
}
