<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Task 12 — Demo seed data for users.
 *
 * Covers three roles across the three demo companies:
 *  role_id 1 = Super Admin  (cross-company access)
 *  role_id 2 = Company Admin
 *  role_id 3 = Operator     (weighbridge operator)
 *
 * Assumes CompanySeeder and SiteSeeder have already run (company_id / site_id references).
 *
 * Run with:  php artisan db:seed --class=UserSeeder
 * All demo passwords are:  Password1!
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Look up company IDs by code so the seeder is not hard-coded to specific IDs
        $ivm = DB::table('companies')->where('code', 'IVM')->value('id');
        $cag = DB::table('companies')->where('code', 'CAG')->value('id');
        $hgc = DB::table('companies')->where('code', 'HGC')->value('id');

        $ivmSite = DB::table('sites')->where('company_id', $ivm)->value('id');
        $cagSite = DB::table('sites')->where('company_id', $cag)->value('id');
        $hgcSite = DB::table('sites')->where('company_id', $hgc)->value('id');

        $demoPassword = Hash::make('Password1!');

        DB::table('users')->insertOrIgnore([
            // ── Super Admin ──────────────────────────────────────────────────
            [
                'firstname'       => 'System',
                'lastname'        => 'Administrator',
                'contact_num'     => '+27 11 000 0001',
                'email'           => 'admin@weighsoft.demo',
                'password'        => $demoPassword,
                'role_id'         => 1,
                'company_id'      => null,
                'site_id'         => null,
                'workstations_id' => null,
                'fingerprint'     => 'demo-super-admin',
                'created_at'      => now(),
                'updated_at'      => now(),
            ],

            // ── Ironveld Mining ──────────────────────────────────────────────
            [
                'firstname'       => 'Thabo',
                'lastname'        => 'Nkosi',
                'contact_num'     => '+27 82 456 7890',
                'email'           => 'thabo.nkosi@ironveld.demo',
                'password'        => $demoPassword,
                'role_id'         => 2,
                'company_id'      => $ivm,
                'site_id'         => $ivmSite,
                'workstations_id' => null,
                'fingerprint'     => 'demo-ivm-admin',
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
            [
                'firstname'       => 'Sipho',
                'lastname'        => 'Dlamini',
                'contact_num'     => '+27 76 555 1100',
                'email'           => 'sipho.dlamini@ironveld.demo',
                'password'        => $demoPassword,
                'role_id'         => 3,
                'company_id'      => $ivm,
                'site_id'         => $ivmSite,
                'workstations_id' => null,
                'fingerprint'     => 'demo-ivm-operator',
                'created_at'      => now(),
                'updated_at'      => now(),
            ],

            // ── Coastal Aggregates ───────────────────────────────────────────
            [
                'firstname'       => 'Priya',
                'lastname'        => 'Naidoo',
                'contact_num'     => '+27 83 321 0987',
                'email'           => 'priya.naidoo@coastalagg.demo',
                'password'        => $demoPassword,
                'role_id'         => 2,
                'company_id'      => $cag,
                'site_id'         => $cagSite,
                'workstations_id' => null,
                'fingerprint'     => 'demo-cag-admin',
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
            [
                'firstname'       => 'Ravi',
                'lastname'        => 'Pillay',
                'contact_num'     => '+27 71 888 4455',
                'email'           => 'ravi.pillay@coastalagg.demo',
                'password'        => $demoPassword,
                'role_id'         => 3,
                'company_id'      => $cag,
                'site_id'         => $cagSite,
                'workstations_id' => null,
                'fingerprint'     => 'demo-cag-operator',
                'created_at'      => now(),
                'updated_at'      => now(),
            ],

            // ── Highveld Grain ───────────────────────────────────────────────
            [
                'firstname'       => 'Johan',
                'lastname'        => 'van der Merwe',
                'contact_num'     => '+27 72 100 2233',
                'email'           => 'johan.vdm@highveldgrain.demo',
                'password'        => $demoPassword,
                'role_id'         => 2,
                'company_id'      => $hgc,
                'site_id'         => $hgcSite,
                'workstations_id' => null,
                'fingerprint'     => 'demo-hgc-admin',
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
            [
                'firstname'       => 'Amahle',
                'lastname'        => 'Zulu',
                'contact_num'     => '+27 84 777 3322',
                'email'           => 'amahle.zulu@highveldgrain.demo',
                'password'        => $demoPassword,
                'role_id'         => 3,
                'company_id'      => $hgc,
                'site_id'         => $hgcSite,
                'workstations_id' => null,
                'fingerprint'     => 'demo-hgc-operator',
                'created_at'      => now(),
                'updated_at'      => now(),
            ],
        ]);
    }
}
