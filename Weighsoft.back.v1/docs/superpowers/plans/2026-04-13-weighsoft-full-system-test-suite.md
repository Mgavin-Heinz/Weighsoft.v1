# Weighsoft Full System Test Suite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive PHPUnit test suite covering every major subsystem of the Weighsoft backend — reporting, weighing flow, contracts/pricing, Xero sync, AS400 export, auth, cameras, settings, crons, and all resource controllers — plus the test infrastructure (factories, seeders, MariaDB test DB, CI integration) required to run it.

**Architecture:** PHPUnit 9 with Laravel 8 test bootstrap. Unit tests exercise pure service methods and SQL builders without a DB; feature tests use a dedicated MariaDB container with truncation-based isolation (not `RefreshDatabase` — schema is too complex with hand-written upgrade scripts). Factories produce the minimum-viable domain graph: Company → Site → Weighbridge/Workstation/Users/Settings → WeighingHeader. Azure Pipelines runs the suite in the existing `weighsoftsa/weighsoft-backv1` image plus a sidecar `mariadb:10.11` service.

**Tech Stack:** PHP 8.3, Laravel 8.40, PHPUnit 9.6, Carbon, Tymon JWT-Auth, Laravel factories (Faker), Mockery, MariaDB 10.11, Docker Compose, Azure Pipelines.

---

## Macro-phase order

This plan executes in **three blocks** — do not interleave them:

1. **Infrastructure** — Phase 0 only. Nothing else runs until this is green.
2. **Refactor** — Phase R. Testability prerequisites. Every task is a pure move-only refactor with no behavior change; each one unlocks specific downstream tests.
3. **Test** — Phases 1–12. Real assertions on real behavior.

Skipping Refactor and jumping straight to tests is possible but will produce shallow tests that mock more than they verify. The ReportingController split we already did is the shape of every Phase R task.

## Execution notes

- Every task is 2–10 minutes of work. Long tasks are split.
- Commit after each task. Branch per phase (`test/phase-0-infra`, `test/phase-r-refactor`, `test/phase-1-reporting`, etc.).
- When a phase completes, merge to `Dev` and cut the next phase branch fresh.
- **Test pattern** (reused throughout):
  1. Write the failing test
  2. Run it, confirm failure and error message
  3. Write minimal implementation / factory / refactor
  4. Run it, confirm pass
  5. Commit
- **Run tests with:** `docker run --rm -v /c/Project/Weighsoft.back.v1:/app -w /app php:8.3-cli vendor/bin/phpunit --filter <TestName>` (local) or the CI job from Task 0.18 (remote).
- Assume `MSYS_NO_PATHCONV=1` prefix on Windows Git Bash for all `docker run` invocations.

---

## Phase 0 — Test Infrastructure

Zero tests run until this phase is done. The existing `phpunit.xml` has DB commented out, `database/factories/` is empty, and there is no test MariaDB. This phase builds all of that.

### Task 0.1: Create a dedicated test database schema and docker-compose service

**Files:**
- Create: `docker/test/docker-compose.yml`
- Create: `docker/test/init.sql`

- [ ] **Step 1: Write the compose file**

```yaml
# docker/test/docker-compose.yml
version: "3.7"
services:
  test-db:
    image: mariadb:10.11
    container_name: weighsoft-test-db
    environment:
      - MARIADB_ROOT_PASSWORD=test
      - MARIADB_DATABASE=weighsoft_test
      - MARIADB_USER=weighsoft
      - MARIADB_PASSWORD=test
    ports:
      - "33062:3306"
    volumes:
      - "./init.sql:/docker-entrypoint-initdb.d/01-init.sql"
    command: >
      --sql-mode=STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION
      --log-bin-trust-function-creators=1
```

- [ ] **Step 2: Create empty init.sql (schema is built by migrations)**

```sql
-- docker/test/init.sql
-- Intentionally empty. Laravel migrations populate this DB at test bootstrap.
SELECT 1;
```

- [ ] **Step 3: Start the container and verify**

```bash
docker compose -f docker/test/docker-compose.yml up -d test-db
docker exec weighsoft-test-db mariadb -uweighsoft -ptest -e "SELECT DATABASE();" weighsoft_test
```
Expected: returns `weighsoft_test`.

- [ ] **Step 4: Commit**

```bash
git add docker/test/
git commit -m "[Test] Add dedicated MariaDB test DB compose stack"
```

### Task 0.2: Wire phpunit.xml to the test DB

**Files:**
- Modify: `phpunit.xml`
- Modify: `.env.testing` (create)

- [ ] **Step 1: Add `.env.testing`**

```env
APP_ENV=testing
APP_DEBUG=true
APP_KEY=base64:testkey000000000000000000000000000000000000=
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=33062
DB_DATABASE=weighsoft_test
DB_USERNAME=weighsoft
DB_PASSWORD=test
MAIL_MAILER=array
QUEUE_CONNECTION=sync
CACHE_DRIVER=array
SESSION_DRIVER=array
JWT_SECRET=test-jwt-secret-long-enough-for-hs256-signing
```

- [ ] **Step 2: Update phpunit.xml**

Replace the `<php>` section with **env-agnostic config only** — DB credentials live in `.env.testing` (Laravel reads `.env.<APP_ENV>` after bootstrap and **overrides** `phpunit.xml`'s `<server>` values, so duplicating them is dead config and a footgun if they drift). Also exclude the `red` group so pinned-bug tests don't break CI:
```xml
<php>
    <server name="APP_ENV" value="testing"/>
    <server name="BCRYPT_ROUNDS" value="4"/>
    <server name="CACHE_DRIVER" value="array"/>
    <server name="MAIL_MAILER" value="array"/>
    <server name="QUEUE_CONNECTION" value="sync"/>
    <server name="SESSION_DRIVER" value="array"/>
    <server name="TELESCOPE_ENABLED" value="false"/>
</php>
<groups>
    <exclude>
        <group>red</group>
        <group>destructive</group>
        <group>cross-tenant</group>
    </exclude>
</groups>
```

Add a separate Azure Pipelines stage (or local script) `vendor/bin/phpunit --group red` that runs nightly and is allowed to fail without blocking merges — its purpose is to surface known-bug status, not to gate releases.

**Tag every "RED — pins bug" test with `@group red`** in its docblock:
```php
/**
 * @group red
 * @link https://example.com/bug-tracker/15
 */
public function test_red_example(): void { ... }
```

- [ ] **Step 3: Commit**

```bash
git add phpunit.xml .env.testing
git commit -m "[Test] Point phpunit at dedicated MariaDB test DB"
```

### Task 0.3: Schema bootstrap — migrations + database_scripts

**Why this task exists:** Production schema = Laravel migrations **plus** 30+ hand-written `database_scripts/*.sql` patches (numbered `0-…` through `19-…`, plus lettered `A-…` through `D-…`, plus `12-addXeroIntegration.sql` which has **no migration equivalent at all**, plus `current.sql`/`old.sql`/`upgrade.sql`). `migrate:fresh` alone produces a schema that diverges from production — Xero tables missing, `weighingheaders.id` declared `string` in migration vs `int` in production, several columns added later via SQL scripts only. Every Phase 1–12 feature test would fail at insert time.

**Approach chosen:** run migrations first, then concatenate and execute `database_scripts/*.sql` in **lexical** order (numerical prefixes ensure correct sequence; lettered scripts run after numbered). Single bootstrap per test process. If this proves slow or the SQL scripts conflict with migration-created tables (e.g., re-create via `CREATE TABLE IF NOT EXISTS`), switch to a dumped-from-prod baseline schema captured in `tests/fixtures/test-schema.sql`.

**Files:**
- Modify: `tests/CreatesApplication.php`
- Modify: `tests/TestCase.php`

- [ ] **Step 1: Add schema bootstrap to CreatesApplication**

```php
<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

trait CreatesApplication
{
    private static bool $bootstrapped = false;

    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make(Kernel::class)->bootstrap();

        if (!self::$bootstrapped && env('APP_ENV') === 'testing') {
            $this->bootstrapSchema();
            self::$bootstrapped = true;
        }

        return $app;
    }

    private function bootstrapSchema(): void
    {
        // 1. Drop everything to ensure a clean slate.
        $connection = DB::connection();
        $connection->statement('SET FOREIGN_KEY_CHECKS=0');
        foreach ($connection->select('SHOW TABLES') as $row) {
            $table = array_values((array) $row)[0];
            $connection->statement("DROP TABLE IF EXISTS `{$table}`");
        }
        foreach ($connection->select("SHOW FUNCTION STATUS WHERE Db = DATABASE()") as $fn) {
            $connection->statement("DROP FUNCTION IF EXISTS `{$fn->Name}`");
        }
        $connection->statement('SET FOREIGN_KEY_CHECKS=1');

        // 2. Run Laravel migrations to lay down the base schema.
        Artisan::call('migrate', ['--force' => true]);

        // 3. Apply database_scripts/*.sql in lexical order to bring schema to prod parity.
        // Skip files explicitly tagged as data-only (B-merge-databases.sql, A-clearSyncTables.sql, C-CleanOutDb.sql).
        $skip = ['A-clearSyncTables.sql', 'B-merge-databases.sql', 'C-CleanOutDb.sql', 'old.sql', 'current.sql'];
        $scripts = glob(base_path('database_scripts/*.sql'));
        sort($scripts, SORT_NATURAL);
        foreach ($scripts as $path) {
            if (in_array(basename($path), $skip, true)) continue;
            $sql = file_get_contents($path);
            // Split on ; at end of line to handle multi-statement scripts; skip empty stmts.
            foreach (preg_split('/;\s*$/m', $sql) as $stmt) {
                $stmt = trim($stmt);
                if ($stmt === '' || str_starts_with($stmt, '--')) continue;
                try {
                    $connection->unprepared($stmt);
                } catch (\Throwable $e) {
                    // Many scripts use IF NOT EXISTS / IF EXISTS but some don't; tolerate
                    // "already exists" / "doesn't exist" so re-runs of the bootstrap are idempotent.
                    $msg = $e->getMessage();
                    if (str_contains($msg, 'already exists') || str_contains($msg, 'Unknown column')) continue;
                    throw new \RuntimeException("Failed to apply {$path}: {$msg}", 0, $e);
                }
            }
        }
    }
}
```

- [ ] **Step 2: Add truncation helper to TestCase**

```php
<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function truncateAllTables(): void
    {
        $connection = DB::connection();
        $connection->statement('SET FOREIGN_KEY_CHECKS=0');
        foreach ($connection->select('SHOW TABLES') as $row) {
            $table = array_values((array) $row)[0];
            if ($table === 'migrations') continue;
            $connection->statement("TRUNCATE TABLE `{$table}`");
        }
        $connection->statement('SET FOREIGN_KEY_CHECKS=1');
    }
}
```

- [ ] **Step 3: Sanity test**

```php
// tests/Feature/BootstrapSmokeTest.php
namespace Tests\Feature;
use Tests\TestCase;

class BootstrapSmokeTest extends TestCase
{
    public function test_migrations_ran_and_tables_exist(): void
    {
        $tables = array_column(
            \DB::select('SHOW TABLES'),
            'Tables_in_weighsoft_test'
        );
        $this->assertContains('companies', $tables);
        $this->assertContains('weighingheaders', $tables);
        $this->assertContains('reporting', $tables);
    }
}
```

- [ ] **Step 4: Run**

`vendor/bin/phpunit --filter BootstrapSmokeTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/CreatesApplication.php tests/TestCase.php tests/Feature/BootstrapSmokeTest.php
git commit -m "[Test] Bootstrap fresh schema into test DB on suite start"
```

### Task 0.4: Trait for per-test truncation

**Files:**
- Create: `tests/Concerns/TruncatesDatabase.php`

- [ ] **Step 1: Write the trait**

```php
<?php

namespace Tests\Concerns;

trait TruncatesDatabase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->truncateAllTables();
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/Concerns/TruncatesDatabase.php
git commit -m "[Test] Add TruncatesDatabase trait for feature-test isolation"
```

### Task 0.5: CompanyFactory

**Files:**
- Create: `database/factories/CompanyFactory.php`

- [ ] **Step 1: Write the factory**

```php
<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'registered_name' => $this->faker->company,
            'trading_name' => $this->faker->company,
            'registration_number' => $this->faker->numerify('##########'),
            'vat_number' => $this->faker->numerify('4##########'),
            'contact_name' => $this->faker->name,
            'contact_email' => $this->faker->safeEmail,
            'contact_number' => $this->faker->phoneNumber,
        ];
    }
}
```

- [ ] **Step 2: Add `HasFactory` trait to model if missing**

Modify `app/Models/Company.php` — add `use HasFactory;` in the class body.

- [ ] **Step 3: Smoke test**

```php
// tests/Unit/Factories/FactorySmokeTest.php
namespace Tests\Unit\Factories;
use App\Models\Company;
use Tests\TestCase;
use Tests\Concerns\TruncatesDatabase;

class FactorySmokeTest extends TestCase
{
    use TruncatesDatabase;

    public function test_company_factory_creates_row(): void
    {
        $c = Company::factory()->create();
        $this->assertDatabaseHas('companies', ['id' => $c->id]);
    }
}
```

- [ ] **Step 4: Run**
`vendor/bin/phpunit --filter FactorySmokeTest`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add database/factories/CompanyFactory.php app/Models/Company.php tests/Unit/Factories/
git commit -m "[Test] CompanyFactory"
```

### Task 0.6: SiteFactory

**Files:**
- Create: `database/factories/SiteFactory.php`
- Modify: `app/Models/Site.php` (add `HasFactory`)

- [ ] **Step 1: Write factory**

```php
<?php

namespace Database\Factories;

use App\Models\Site;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class SiteFactory extends Factory
{
    protected $model = Site::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'site_name' => $this->faker->city . ' Site',
            'measure_type' => 'KG',
            'decimals' => 0,
            'contract_enabled' => 'false',
        ];
    }

    public function asTons(): static
    {
        return $this->state(['measure_type' => 't', 'decimals' => 3]);
    }

    public function contractEnabled(): static
    {
        return $this->state(['contract_enabled' => 'true']);
    }
}
```

- [ ] **Step 2: Test + commit** (same pattern as Task 0.5)

### Task 0.7: UserFactory, UserTypeFactory

**Files:**
- Modify: `database/factories/UserFactory.php` (Laravel ships one — align to our columns)
- Create: `database/factories/UserTypeFactory.php`

- [ ] **Step 1: Write UserTypeFactory**

```php
<?php

namespace Database\Factories;

use App\Models\UserType;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserTypeFactory extends Factory
{
    protected $model = UserType::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Admin', 'Operator', 'Supervisor']),
            'level' => $this->faker->numberBetween(1, 5),
        ];
    }
}
```

- [ ] **Step 2: Replace default UserFactory**

```php
<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserType;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'password' => Hash::make('secret'),
            'company_id' => Company::factory(),
            'user_type_id' => UserType::factory(),
        ];
    }
}
```

- [ ] **Step 3: Test + commit**

### Task 0.8: WeighingTypes (settings) + AxelTypes + AxelSetups factories

**Files:**
- Create: `database/factories/SettingsFactory.php`
- Create: `database/factories/AxelTypesFactory.php`
- Create: `database/factories/AxelSetupsFactory.php`

- [ ] **Step 1: SettingsFactory**

```php
<?php

namespace Database\Factories;

use App\Models\settings;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class SettingsFactory extends Factory
{
    protected $model = settings::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['Inbound', 'Outbound', 'Internal']),
            'company_id' => Company::factory(),
            'goods_type' => '1',
            'contract_enabled' => 'false',
            'export_AS400' => 'false',
        ];
    }

    public function withCustomField(int $i, string $name, string $report = 'Yes'): static
    {
        return $this->state([
            "user_defined_name{$i}" => $name,
            "user_defined_rep{$i}" => $report,
        ]);
    }
}
```

- [ ] **Step 2: AxelTypesFactory + AxelSetupsFactory** (follow pattern)

- [ ] **Step 3: Commit**

### Task 0.9: Weighbridge + Workstation factories

**Files:**
- Create: `database/factories/WeighbridgeFactory.php`
- Create: `database/factories/WorkStationsFactory.php`

- [ ] **Step 1: WeighbridgeFactory**

```php
<?php

namespace Database\Factories;

use App\Models\Weighbridge;
use App\Models\Site;
use Illuminate\Database\Eloquent\Factories\Factory;

class WeighbridgeFactory extends Factory
{
    protected $model = Weighbridge::class;

    public function definition(): array
    {
        return [
            'name' => 'Bridge ' . $this->faker->numerify('##'),
            'site_id' => Site::factory(),
            'max_capacity' => 80000,
        ];
    }
}
```

- [ ] **Step 2: WorkStationsFactory** (analogous)
- [ ] **Step 3: Commit**

### Task 0.10: Product / BusinessPartner / Haulier factories

**Files:** `ProductFactory.php`, `BusinessPartnerFactory.php`, `HaulierFactory.php`

- [ ] **Step 1: ProductFactory**

```php
<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'code' => strtoupper($this->faker->bothify('??##')),
            'company_id' => Company::factory(),
            'vat' => 15,
            'purchase_price' => $this->faker->randomFloat(2, 100, 5000),
            'sale_price' => $this->faker->randomFloat(2, 200, 6000),
        ];
    }
}
```

- [ ] **Step 2: BusinessPartnerFactory, HaulierFactory** (analogous — both need `site_id` foreign keys)

- [ ] **Step 3: Commit**

### Task 0.11: Contract + ContractTransactions factories

**Files:** `ContractsFactory.php`, `ContractTransactionsFactory.php`

- [ ] **Step 1: ContractsFactory**

```php
<?php

namespace Database\Factories;

use App\Models\Contracts;
use App\Models\Product;
use App\Models\BusinessPartner;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContractsFactory extends Factory
{
    protected $model = Contracts::class;

    public function definition(): array
    {
        return [
            'name' => 'Contract ' . $this->faker->numerify('####'),
            'product_id' => Product::factory(),
            'businesspartner_id' => BusinessPartner::factory(),
            'price' => $this->faker->randomFloat(2, 500, 5000),
            'packaging_price_per_ton' => 0,
            'shipping_price_per_ton' => 0,
            'total_tonnes' => 100,
            'remaining_tonnes' => 100,
        ];
    }
}
```

- [ ] **Step 2: ContractTransactionsFactory** (analogous)
- [ ] **Step 3: Commit**

### Task 0.12a: Audit weighingHeaders model + migration before writing factory

**Why split:** the `weighingheaders` table has a string PK with no auto-increment in the migration (vs. int in production — see Task 0.3 schema-bootstrap notes), and several NOT NULL FKs that the original draft factory missed. Audit before coding.

**Files:**
- Read: `app/Models/weighingHeaders.php`
- Read: `database/migrations/*create_weighing_headers_table*.php`

- [ ] **Step 1: Confirm the model + migration**

```bash
grep -E '\$(incrementing|keyType|primaryKey|fillable)\s*=' app/Models/weighingHeaders.php
grep -E '\$table->' database/migrations/*create_weighing_headers_table*.php
```

Capture: PK column name + type, every NOT NULL column, every FK column. Document inline below.

- [ ] **Step 2: If `$incrementing` is missing or true, the model is broken for string PK** — set `protected $incrementing = false; protected $keyType = 'string';` in the model itself (not just the factory). This is a refactor; either (a) park as Phase R task, or (b) fix here if the schema-bootstrap path produces an int-PK schema (post-Task 0.3 the `database_scripts/*.sql` may override the migration column type — verify with `DESCRIBE weighingheaders;` after bootstrap).
- [ ] **Step 3: Commit the model change (if any) separately from the factory.**

### Task 0.12b: WeighingHeader factory with state variants

**Files:** `database/factories/WeighingHeaderFactory.php`

**Pre-req:** Task 0.12a done — you know whether `id` is string-UUID or int-auto-increment in the bootstrapped test schema, and whether the model has been corrected.

- [ ] **Step 1: Factory** (assumes int-auto-increment id post-bootstrap; if string PK survives, add `'id' => (string) Str::uuid()` to the definition)

```php
<?php

namespace Database\Factories;

use App\Models\weighingHeaders;
use App\Models\Company;
use App\Models\Site;
use App\Models\Weighbridge;
use App\Models\WorkStations;
use App\Models\settings;
use App\Models\User;
use App\Models\Product;
use App\Models\BusinessPartner;
use App\Models\Haulier;
use Illuminate\Database\Eloquent\Factories\Factory;

class WeighingHeaderFactory extends Factory
{
    protected $model = weighingHeaders::class;

    public function definition(): array
    {
        return [
            'transaction' => $this->faker->unique()->numerify('WH######'),
            'RegNumber' => strtoupper($this->faker->bothify('??##???GP')),
            'company_id' => Company::factory(),
            'site_id' => Site::factory(),
            'weighbridge_id' => Weighbridge::factory(),
            'workstation_id' => WorkStations::factory(),  // NOT NULL FK — original draft missed this; every insert errored.
            'settings_id' => settings::factory(),
            'product_id' => Product::factory(),
            'businesspartner_id' => BusinessPartner::factory(),
            'haulier_id' => Haulier::factory(),
            'firstWeightUserId' => User::factory(),
            'FirstWeight' => 40000,
            'SecondWeight' => 15000,
            'TotalWeight' => 40000,
            'NettWeight' => 25000,
            'moisture_deduction' => 0,
            'moisture_threshold' => 0,
            'status' => 'OPEN',
        ];
    }

    public function closed(): static
    {
        return $this->state([
            'status' => 'CLOSED',
            'secondWeightUserId' => User::factory(),
        ]);
    }

    public function deleted(): static
    {
        return $this->state([
            'deleted_at' => now(),
            'deletedUserId' => User::factory(),
            'reason' => 'Test deletion',
        ]);
    }

    public function withMoisture(float $threshold, float $deduction): static
    {
        return $this->state([
            'moisture_threshold' => $threshold,
            'moisture_deduction' => $deduction,
        ]);
    }
}
```

- [ ] **Step 2:** Smoke test:
```php
public function test_weighing_header_factory_creates_row(): void
{
    $h = weighingHeaders::factory()->create();
    $this->assertDatabaseHas('weighingheaders', ['id' => $h->id]);
    $this->assertNotEmpty($h->workstation_id);
}
```
- [ ] **Step 3: Commit.**

### Task 0.12c: Audit the rest of the factory list against actual columns

**Why:** the original draft has known mistakes — `BusinessPartner` factory was annotated as needing `site_id` (probably `company_id`); `Reporting` used `jsondata` (verify column name); `Contracts` referenced `total_tonnes`/`remaining_tonnes` (verify existence post-bootstrap). Cheap to audit, painful to debug later.

- [ ] **Step 1:** For each factory written in Tasks 0.5–0.14, run:
```bash
docker exec weighsoft-test-db mariadb -uweighsoft -ptest weighsoft_test -e "DESCRIBE <table>;"
```
and reconcile against the factory definition. Fix mismatches (column name typos, missing NOT NULL columns, wrong FK references).
- [ ] **Step 2:** Commit each correction with a clear `[Test] <Factory>: align <field> with schema` message.

### Task 0.13: Reporting + Exceptions factories

**Files:** `ReportingFactory.php`, `ExceptionsFactory.php`

- [ ] **Step 1: ReportingFactory**

```php
<?php

namespace Database\Factories;

use App\Models\Reporting;
use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReportingFactory extends Factory
{
    protected $model = Reporting::class;

    public function definition(): array
    {
        return [
            'name' => 'Report ' . $this->faker->word,
            'description' => $this->faker->sentence,
            'company_id' => Company::factory(),
            'email' => $this->faker->safeEmail,
            'schedule' => 'daily',
            'time_frame' => 1,
            'show_deleted' => 'No',
            'jsondata' => json_encode([
                'Columns' => ['Transaction Date', 'Nett Weight'],
                'Filters' => ['Date Range'],
                'Groupings' => [],
                'ReportType' => ['value' => 'transaction'],
            ]),
        ];
    }

    public function withDefinition(array $def): static
    {
        return $this->state(['jsondata' => json_encode($def)]);
    }
}
```

- [ ] **Step 2: ExceptionsFactory** (analogous)
- [ ] **Step 3: Commit**

### Task 0.14: Camera / Tare / Pallet / Grade / RFIDVehicle factories

**Files:** `CameraFactory.php`, `TareFactory.php`, `PalletFactory.php`, `GradeFactory.php`, `RFIDVehicleFactory.php`

- [ ] **Step 1: Write each** (same pattern as earlier factories; field list taken from each model's `$fillable`)
- [ ] **Step 2: Commit**

### Task 0.15: Test seeder for end-to-end domain graph

**Files:** `database/seeders/TestDomainSeeder.php`

- [ ] **Step 1: Write seeder**

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\Site;
use App\Models\User;
use App\Models\UserType;
use App\Models\settings;
use App\Models\Weighbridge;
use App\Models\WorkStations;
use App\Models\Product;
use App\Models\BusinessPartner;
use App\Models\Haulier;

class TestDomainSeeder extends Seeder
{
    public function run(): void
    {
        $company = Company::factory()->create(['registered_name' => 'Acme Mills']);
        $site = Site::factory()->for($company)->create(['site_name' => 'Main', 'measure_type' => 't', 'decimals' => 3]);

        UserType::factory()->create(['name' => 'Admin', 'level' => 5]);
        User::factory()->for($company)->create(['email' => 'admin@acme.test']);

        settings::factory()->for($company)->create(['name' => 'Inbound']);
        Weighbridge::factory()->for($site)->create(['name' => 'Bridge 01']);
        WorkStations::factory()->for($site)->create(['workstation_name' => 'WS-1']);

        Product::factory()->for($company)->count(3)->create();
        BusinessPartner::factory()->for($site)->count(2)->create();
        Haulier::factory()->count(2)->create();
    }
}
```

- [ ] **Step 2: Register in DatabaseSeeder and commit**

### Task 0.16: Base FeatureTestCase with auth helpers

**Files:** `tests/Feature/FeatureTestCase.php`

- [ ] **Step 1: Write the class**

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;
use Tests\Concerns\TruncatesDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;

abstract class FeatureTestCase extends TestCase
{
    use TruncatesDatabase;

    protected function actingAsUser(User $user = null): User
    {
        $user = $user ?? User::factory()->create();
        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', "Bearer {$token}");
        return $user;
    }

    protected function jsonAuthed(string $method, string $uri, array $data = []): \Illuminate\Testing\TestResponse
    {
        if (!isset($this->defaultHeaders['Authorization'])) {
            $this->actingAsUser();
        }
        return $this->json($method, $uri, $data);
    }
}
```

- [ ] **Step 2: Commit**

### Task 0.17: Helper for building in-memory Reporting definitions

**Files:** `tests/Support/ReportDefinitionBuilder.php`

- [ ] **Step 1: Write builder**

```php
<?php

namespace Tests\Support;

class ReportDefinitionBuilder
{
    public array $columns = [];
    public array $filters = [];
    public array $groupings = [];
    public string $reportType = 'transaction';

    public static function transaction(): self { return (new self())->ofType('transaction'); }
    public static function exception(): self { return (new self())->ofType('exception'); }

    public function ofType(string $t): self { $this->reportType = $t; return $this; }
    public function withColumns(string ...$cols): self { $this->columns = $cols; return $this; }
    public function withFilters(string ...$f): self { $this->filters = $f; return $this; }
    public function withGroupings(string ...$g): self { $this->groupings = $g; return $this; }

    public function toArray(): array
    {
        return [
            'Columns' => $this->columns,
            'Filters' => $this->filters,
            'Groupings' => $this->groupings,
            'ReportType' => ['value' => $this->reportType],
        ];
    }
}
```

- [ ] **Step 2: Commit**

### Task 0.18: Azure Pipelines job (corrected — uses container job + service container, JUnit to junit.xml not phpunit.xml)

**Why this layout:**
- Azure Pipelines `services:` are only network-addressable by hostname when the **job itself runs in a container** (via `container:`). Without `container:`, the steps run on the host VM and can only reach the service via published ports — and a nested `docker run --rm` from those steps wouldn't be on the services network at all.
- `--log-junit phpunit.xml` overwrites the config file at the repo root (same name). Use `junit.xml`.
- DB credentials live in `.env.testing` (per Task 0.2), but its `DB_HOST=127.0.0.1` is wrong for CI where the host is `mariadb`. Solution: ship a separate `.env.testing.ci` and copy it over in the pipeline.

**Files:**
- Modify: `azure-pipelines.yml`
- Create: `.env.testing.ci`

- [ ] **Step 1: Create the CI-specific env override**

```env
# .env.testing.ci — copied over .env.testing inside the pipeline before tests run
APP_ENV=testing
APP_DEBUG=true
APP_KEY=base64:testkey000000000000000000000000000000000000=
DB_CONNECTION=mysql
DB_HOST=mariadb
DB_PORT=3306
DB_DATABASE=weighsoft_test
DB_USERNAME=weighsoft
DB_PASSWORD=test
MAIL_MAILER=array
QUEUE_CONNECTION=sync
CACHE_DRIVER=array
SESSION_DRIVER=array
JWT_SECRET=test-jwt-secret-long-enough-for-hs256-signing
```

- [ ] **Step 2: Add test stage to azure-pipelines.yml**

```yaml
- stage: Test
  jobs:
    - job: phpunit
      pool:
        vmImage: 'ubuntu-latest'
      container:
        image: php:8.3-cli
      services:
        mariadb: mariadb-svc
      steps:
        - script: |
            apt-get update -qq
            apt-get install -y -qq git unzip libzip-dev libonig-dev default-mysql-client
            docker-php-ext-install zip mbstring pdo_mysql
            curl -sS https://getcomposer.org/installer | php -- --quiet
            php composer.phar install --no-interaction --prefer-dist
          displayName: Install PHP extensions and composer deps

        - script: |
            cp .env.testing.ci .env.testing
            # Wait for MariaDB to accept connections (service container can lag at job start).
            for i in $(seq 1 30); do
              if mysqladmin ping -h mariadb -uweighsoft -ptest --silent; then exit 0; fi
              sleep 1
            done
            echo "MariaDB did not become ready in 30s" >&2
            exit 1
          displayName: Wait for MariaDB

        - script: vendor/bin/phpunit --log-junit junit.xml --no-coverage
          displayName: Run PHPUnit

        - task: PublishTestResults@2
          inputs:
            testResultsFormat: JUnit
            testResultsFiles: junit.xml
            failTaskOnFailedTests: true
            testRunTitle: 'PHPUnit'
          condition: always()

resources:
  containers:
    - container: mariadb-svc
      image: mariadb:10.11
      env:
        MARIADB_ROOT_PASSWORD: test
        MARIADB_DATABASE: weighsoft_test
        MARIADB_USER: weighsoft
        MARIADB_PASSWORD: test
      options: --health-cmd="mysqladmin ping -h localhost -uweighsoft -ptest --silent" --health-interval=5s --health-retries=10
      command: ["--sql-mode=STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION", "--log-bin-trust-function-creators=1"]
```

- [ ] **Step 3: Test locally first** — the Azure-Pipelines-specific `services:` mapping isn't easy to dry-run, but you can sanity-check the plumbing with docker compose:

```bash
docker compose -f docker/test/docker-compose.yml up -d test-db
docker run --rm --network host -v "$(pwd):/app" -w /app -e DB_HOST=127.0.0.1 -e DB_PORT=33062 php:8.3-cli bash -c "
  apt-get update -qq && apt-get install -y -qq libzip-dev libonig-dev default-mysql-client &&
  docker-php-ext-install zip mbstring pdo_mysql &&
  vendor/bin/phpunit --no-coverage
"
```
Expected: tests run; if they don't, fix locally before pushing CI changes.

- [ ] **Step 4: Push to a feature branch first** — Azure Pipelines YAML changes are best validated by triggering an actual run, not by visual review. After CI is green on the feature branch once, merge.

- [ ] **Step 5: Commit**

### Task 0.19: Document running the suite locally

**Files:** Modify `CLAUDE.md` — add a "Testing" section documenting the commands.

- [ ] **Step 1:** Append to CLAUDE.md:

```markdown
## Testing

Start the test DB once per session:
```
docker compose -f docker/test/docker-compose.yml up -d test-db
```

Run the suite (PHP 8.3 + composer deps installed in ephemeral container):
```
docker run --rm -v /c/Project/Weighsoft.back.v1:/app -w /app php:8.3-cli vendor/bin/phpunit
```

Single test:
```
... vendor/bin/phpunit --filter TestClassName::test_method_name
```

Truncate vs. RefreshDatabase: this repo uses hand-written SQL upgrade scripts on live deployments, so `RefreshDatabase` cannot rebuild schema reliably. Feature tests use `Tests\Concerns\TruncatesDatabase` instead.
```

- [ ] **Step 2: Commit**

### Task 0.20: database_scripts/*.sql smoke test

**Why:** these scripts run against live customer databases on upgrade. A broken script ships untested today. Smoke test asserts each one applies cleanly to a fresh DB and the final schema contains the expected tables/columns. Catches the same class of bug that R.10 logs about: silent script failures.

**Files:** `tests/Feature/Bootstrap/DatabaseScriptsSmokeTest.php`

- [ ] **Step 1: Test that asserts scripts apply cleanly + key tables exist**

```php
<?php

namespace Tests\Feature\Bootstrap;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseScriptsSmokeTest extends TestCase
{
    public function test_all_database_scripts_apply_cleanly_and_produce_expected_schema(): void
    {
        // Schema bootstrap (Task 0.3) already runs the scripts. Verify outcome:
        $tables = array_column(DB::select('SHOW TABLES'), 'Tables_in_weighsoft_test');

        // Tables that ONLY exist after database_scripts run (no migration equivalent):
        $expectFromScripts = [
            'XeroSettings', 'XeroSyncLog', 'XeroInvoiceQueue',  // 12-addXeroIntegration.sql
            // Add other script-only tables here as you discover them.
        ];
        foreach ($expectFromScripts as $t) {
            $this->assertContains($t, $tables, "Expected table {$t} to exist after database_scripts/*.sql ran.");
        }

        // Columns added by scripts that migrations don't have:
        $weighingHeadersCols = array_column(DB::select('DESCRIBE weighingheaders'), 'Field');
        foreach (['stockpile_nr', 'destination', 'order_numbers', 'contract_packaging_price_per_ton', 'contract_shipping_price_per_ton'] as $c) {
            $this->assertContains($c, $weighingHeadersCols, "Expected weighingheaders.{$c} column.");
        }
    }
}
```

- [ ] **Step 2: Run** — if it fails, the schema-bootstrap Task 0.3 missed something. Fix Task 0.3 until this test passes.
- [ ] **Step 3: Commit**

### Task 0.21: Cross-company isolation helper for FeatureTestCase

**Why:** Phase 10's CRUD template and Phase 11.3 alone are not enough — every resource controller can leak cross-tenant data. A reusable helper makes per-controller isolation cheap to assert.

**Files:** Modify `tests/Feature/FeatureTestCase.php`

- [ ] **Step 1: Add helper**

```php
/**
 * Assert that a request authenticated as a user from $companyA cannot
 * see/modify a resource belonging to $companyB. Use in every Phase 10 task.
 *
 * @param  string  $route  e.g. "/api/contract/{id}"
 * @param  string  $method GET, POST, PUT, DELETE
 * @param  callable(Company): \Illuminate\Database\Eloquent\Model  $createForCompany
 */
protected function assertCannotSeeOtherCompanyData(string $route, string $method, callable $createForCompany): void
{
    $companyA = \App\Models\Company::factory()->create();
    $companyB = \App\Models\Company::factory()->create();
    $userA = \App\Models\User::factory()->for($companyA)->create();
    $resourceB = $createForCompany($companyB);

    $this->actingAsUser($userA);
    $url = str_replace('{id}', (string) $resourceB->id, $route);
    $response = $this->json($method, $url);

    $this->assertContains(
        $response->status(),
        [403, 404],
        "Expected company-scoped {$method} {$url} to be denied (403/404), got {$response->status()}. Cross-tenant leak."
    );
}
```

- [ ] **Step 2: Smoke** — write a single test that uses it on `/api/contract/{id}` GET. Confirm it correctly fails (returns 200 instead of 403/404) — this is the **expected red signal** documenting the current state of cross-tenant exposure. Tag with `@group cross-tenant`.
- [ ] **Step 3: Commit**

---

## Phase R — Refactor for Testability

Every task here is a **move-only refactor**: extract methods, remove side effects in constructors, replace `new Service()` with dependency injection, swap `$_GET` for `Request`. Each task closes with `php -l` syntax check and a manual sanity hit against the existing endpoint to confirm zero behavior change before commit.

### Task R.1: Extract buildSql/execute pattern already exists for ReportingController

- [ ] Verify nothing to do — already shipped in commit `6544196`. Skip.

### Task R.2: WeighingHeaderService — inject dependencies via constructor

**Files:** `app/Services/WeighingHeaderService.php`, callers.

- [ ] **Step 1:** Identify every `new X()` inside service methods. Hoist them into constructor-injected properties.
- [ ] **Step 2:** Update every caller (controllers) to resolve via container: `app(WeighingHeaderService::class)`.
- [ ] **Step 3:** `php -l` + manual curl test of create/close endpoints.
- [ ] **Step 4:** Commit `"[Refactor] WeighingHeaderService constructor injection"`.

### Task R.3: WeighingTransactionService — same treatment

### Task R.4: WeighingCameraService — abstract HTTP client behind an interface

- [ ] Create `App\Services\CameraImageFetcher` interface with `fetch(string $ip): ?string`.
- [ ] Move Guzzle wiring into `GuzzleCameraImageFetcher` (default binding).
- [ ] Inject into `WeighingCameraService`. Tests can swap with a fake.

### Task R.5: ReportEmailer — split "compute window" from "send" from "advance last_report_on"

- [ ] Pull `resolveDateRange(Reporting $r): array` into a public method.
- [ ] Pull `advanceLastReportOn(Reporting $r, Carbon $sentAt): void` (currently missing — creates the hook for bug #15 fix).
- [ ] Pull `buildPerTypeData(...)` out of `TransactionReport` so tests can assert on the runtime `$data` object per weighing type without actually sending.

### Task R.6: Extract ReportDataBuilder service — do NOT inject the controller

**Why a new service instead of injecting the controller:** `ReportingController` extends `JwtAuthController` whose constructor calls `$this->middleware('auth:api')` and `auth()->user()`. In CLI/cron context, `auth()->user()` returns null and the constructor's `return response('Not Found', 404)` is silently discarded (constructors can't return values). Today this works only because nothing downstream in `GetData` reads `$this->user`. Container-resolved injection (the original draft of R.6) would keep this latent footgun: any future code in `GetData`/`buildReportSql`/`executeReportSql` that touches `$this->user` would NPE silently in cron logs only — invisible until customer impact.

**Better approach:** lift the data-building logic out of the controller into a fresh `App\Services\ReportDataBuilder` service that has no JWT inheritance and no Request dependency. Controller becomes a thin HTTP wrapper that delegates.

**Files:**
- Create: `app/Services/ReportDataBuilder.php`
- Modify: `app/Http/Controllers/ReportingController.php` — `GetData`, `buildReportSql`, `executeReportSql` methods become thin pass-throughs
- Modify: `app/Services/ReportEmailer.php` — inject `ReportDataBuilder` instead of constructing `ReportingController`

- [ ] **Step 1: Create `App\Services\ReportDataBuilder` with three public methods (move-only):**

```php
<?php

namespace App\Services;

class ReportDataBuilder
{
    private $Reporting;
    private $SQLQuery;

    public function getData($data): array { /* moved verbatim from ReportingController::GetData */ }
    public function buildReportSql($data, $report): array { /* moved verbatim */ }
    public function executeReportSql(string $sql, bool $needsGroupToggle, $data): array { /* moved verbatim */ }
}
```

- [ ] **Step 2: Make `ReportingController::GetData` delegate**

```php
public function GetData($data)
{
    return app(ReportDataBuilder::class)->getData($data);
}
```

(Keep `buildReportSql` / `executeReportSql` as delegating wrappers too, since `ReportingSqlBuilderTest` calls them directly via reflection — keep that test working without rewriting it.)

- [ ] **Step 3: Update `ReportEmailer::TransactionReport`**

```php
// Replace:
$rep = new ReportingController();
$reportData = $rep->GetData($data);

// With:
$reportData = app(ReportDataBuilder::class)->getData($data);
```

- [ ] **Step 4: Run the existing `ReportingSqlBuilderTest` — must stay 8/8 green** (it calls `buildReportSql` on a fresh controller; the delegating wrapper must preserve that interface).

- [ ] **Step 5: Manual smoke** — hit `GET /api/reporting/{id}/edit?DateRange=...` against a dev DB, confirm output identical to pre-refactor.

- [ ] **Step 6: Commit** — `[Refactor] Extract ReportDataBuilder service — remove JwtAuth dependency from cron-invoked report data path`.

### Task R.7: ReportingController::index — swap `$_GET` for `$request`

- [ ] One-line change in ReportingController, one-line change in any other controller using `$_GET`. Grep first.

```bash
grep -rn '\$_GET\[' app/Http/Controllers/
```

- [ ] Replace each usage. Re-run any affected feature after infra is up.

### Task R.8: Remove global `error_reporting(E_ALL ^ E_NOTICE ^ E_WARNING)` at file top

**Files:** any controller that has this at the top — start with `app/Http/Controllers/ReportingController.php` line 5.

- [ ] Remove the line. Run the full test suite — expect some code paths to now surface real warnings. Fix each (usually an undefined property like `$data->Exception`) by adding explicit null-coalesce.

### Task R.9: ContractTransactionService — extract price resolution to match ReportPricingSqlHelper

- [ ] Ensure single source of truth: if both the PHP service and the SQL helper compute prices, they must agree. Add a cross-check test in Phase 3.

### Task R.10: SendReports command — restore error logging

Fix bug #17 as a refactor (behavior change: emit logs). This is a pre-req for Phase 9 assertion tests.

```php
} catch (\Exception $e) {
    Log::error('reporting:email failed', ['exception' => $e, 'reportId' => $this->argument('reportId')]);
    return -1;
}
```

### Task R.11: Report mailable — make CSV filename include a timestamp + uuid

Fix bug #18. Changes `storage_path("app/public/{$reportName}.csv")` to include uniqueness. Unlocks Phase 9 Task 9.7.

### Task R.12: Report mailable — collect fopen failures, don't early-return

Fix bug #20. Replace `return $view;` on failure with accumulating an error attachment and continuing. Unlocks Phase 9 Task 9.6.

### Task R.13: Move last_report_on advance from Kernel after() hook to post-success in ReportEmailer

**The actual bug — corrected:** `last_report_on` IS being advanced today, in `app/Console/Kernel.php:38-41`'s `->after()` callback. The bug is that Laravel's `->after()` fires regardless of the inner command's exit code — so failed sends still advance the window, dropping data on the next run. My earlier diagnosis ("never advances") was wrong; the reviewer caught this.

**Three coordinated changes — must ship together with R.10 (restore SendReports logging) in a single commit:**

- [ ] **Step 1: Delete the Kernel.php after() hook**

```php
// app/Console/Kernel.php — change lines 37-42 from:
foreach ($reports as $report) {
    $schedule->command("reporting:email $report->id")->cron($report->schedule)->after(function() use ($report) {
        $time = Carbon::now();
        Reporting::where('id', $report->id)->update(['last_report_on' => $time->toDateTimeString()]);
    });
}
// to:
foreach ($reports as $report) {
    $schedule->command("reporting:email $report->id")->cron($report->schedule);
}
```

- [ ] **Step 2: Advance inside ReportEmailer ONLY after successful Mail::send**

```php
// app/Services/ReportEmailer.php — at the end of SendReportEmails, after SendEmail returns:
$this->SendEmail($emails, "WeighSoft Transaction Report for " . $start, $reportData, $start, $end, $report);

// New: advance only if the send did not throw.
$report->update(['last_report_on' => Carbon::now()->toDateTimeString()]);
```

If `SendEmail` throws (Mail facade error, SMTP failure, etc.), the update line is never reached and `last_report_on` stays at its previous value — next run reprocesses the missed window. This is the desired safety property.

- [ ] **Step 3: Verify the failure path explicitly via test (Phase 1 Task 1.13 — flip the assertion)**

Currently red:
```php
$this->assertEquals($previousValue, $report->fresh()->last_report_on);  // documenting the bug
```

After R.13 ships, becomes green:
```php
// Success path — last_report_on advanced
$this->actingFreshTime(...);
$report = Reporting::factory()->create(['last_report_on' => '2026-01-01 00:00:00']);
(new ReportEmailer())->SendReportEmails($report->id);
$this->assertGreaterThan(Carbon::parse('2026-01-01'), $report->fresh()->last_report_on);

// Failure path — last_report_on UNCHANGED
Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP down'));
$report = Reporting::factory()->create(['last_report_on' => '2026-01-01 00:00:00']);
try { (new ReportEmailer())->SendReportEmails($report->id); } catch (\Throwable) { /* swallowed by SendReports::handle */ }
$this->assertEquals('2026-01-01 00:00:00', $report->fresh()->last_report_on->toDateTimeString());
```

- [ ] **Step 4: Manual sanity** — run `php artisan reporting:email <id>` against a known-good report on a dev DB, confirm `last_report_on` advanced; then deliberately break `MAIL_HOST`, run again, confirm it did NOT advance.

- [ ] **Step 5: Single commit** — `[Refactor+Fix] Move last_report_on advance to post-success path so failed sends don't drop the window` — paired with R.10 (logging) so any future failure surfaces in logs instead of silently retrying-then-skipping.

### Task R.14: ReportEmailer — pass through saved Filters (Site/Weighbridge/Product/etc.) from the report definition

Fix bug #13. Build `$data` from the saved report's `Filters` + any per-Setting overrides, not hardcoded `''`. Unlocks Phase 1 Task 1.14 flip.

### Task R.15: Commit phase, merge to Dev

**Phase R complete when:**
- All affected endpoints still respond identically to pre-refactor baseline
- `php -l` clean on every touched file
- No behavior changes other than the explicitly called-out bug fixes (R.10–R.14)

---

## Phase 1 — Reporting (extend existing coverage)

Builds on `tests/Unit/ReportingSqlBuilderTest.php`. Adds feature tests that hit the real DB plus unit tests for branches we haven't covered.

### Task 1.1: Feature test — edit endpoint returns built report data

**Files:** `tests/Feature/Reporting/RunReportTest.php`

- [ ] **Step 1: Write the test**

```php
<?php

namespace Tests\Feature\Reporting;

use App\Models\Company;
use App\Models\Reporting;
use App\Models\weighingHeaders;
use Tests\Feature\FeatureTestCase;
use Tests\Support\ReportDefinitionBuilder;

class RunReportTest extends FeatureTestCase
{
    public function test_run_report_returns_closed_weighings_in_date_range(): void
    {
        $company = Company::factory()->create();
        $this->actingAsUser();

        weighingHeaders::factory()->for($company)->closed()->count(3)->create([
            'updated_at' => now()->subHour(),
        ]);
        weighingHeaders::factory()->for($company)->closed()->count(2)->create([
            'updated_at' => now()->subDays(30),
        ]);

        $def = ReportDefinitionBuilder::transaction()
            ->withColumns('Transaction No', 'Nett Weight')
            ->withFilters('Date Range')
            ->toArray();

        $report = Reporting::factory()->for($company)->withDefinition($def)->create();

        $response = $this->jsonAuthed('GET', "/api/reporting/{$report->id}/edit?DateRange=" . urlencode(json_encode([
            'startDate' => now()->subDay()->toDateTimeString(),
            'endDate'   => now()->toDateTimeString(),
        ])));

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }
}
```

- [ ] **Step 2: Run, confirm PASS, commit**

### Task 1.2: Edit endpoint returns Error when DateRange missing

- [ ] Write test that asserts JSON response contains `Error` with DateRange text and no `data` rows.

### Task 1.3: Edit endpoint respects show_deleted=Yes

- [ ] Create 3 closed + 2 soft-deleted weighings. With `show_deleted='Yes'` report, expect 5 rows; with `'No'`, expect 3.

### Task 1.4: Custom Fields column populates when Setting is passed

- [ ] Use `SettingsFactory::withCustomField(1, 'Driver Name')`. Assert SQL contains the alias and that a weighing with `Custom1='Bob'` renders that value.

### Task 1.5: Custom Fields dropped when Setting missing

- [ ] Extend the existing unit test to assert the column simply vanishes from the SQL.

### Task 1.6: buildReportSql with Stockpile Nr / Destination / Order Numbers filters uses PDO quote

- [ ] Assert SQL contains `stockpile_nr = '...'` with the test value, and that `'` in the value is escaped.

### Task 1.7: Grouping by Site+Product produces `GROUP BY` with both IFNULL subqueries

- [ ] Assert string presence of both correlated subqueries in that exact order.

### Task 1.8: executeReportSql restores sql_mode after groupings query

- [ ] Mock `DB::connection()->getPdo()` with a Mockery spy, confirm the two `SET SESSION sql_mode=...` statements run in the right order.

### Task 1.9: executeReportSql returns error payload on SQL failure

- [ ] Pass intentionally bad SQL (`"SELECT foo FROM no_such_table"`), assert response contains `error` key and `data` is `[]`.

### Task 1.10: Feature test — /reportEmail endpoint queues email via Mail::fake()

- [ ] Use `Mail::fake()`, POST to `/reportEmail`, assert `Report` mailable dispatched to the recipients from the `reporting.email` field.

### Task 1.11: Unit test — ReportEmailer honors time_frame > 0

- [ ] Factory report with `time_frame=7`. Freeze time. Inject a spying ReportingController that records the `$data->DateRange` passed, assert it spans exactly 7 days back.

### Task 1.12: Unit test — ReportEmailer falls back to last_report_on when time_frame=0

- [ ] Set `last_report_on` to specific datetime. Assert the DateRange start matches.

### Task 1.13: Red test — ReportEmailer does not advance last_report_on after send

Pins bug #15. Expected fix (separate phase) will update `last_report_on = now()` after `SendReportEmails` returns successfully.

- [ ] Assert `$report->fresh()->last_report_on` equals the previous value (documenting current broken behavior; later fix flips this assertion).

### Task 1.14: Red test — ReportEmailer ignores saved Site/Weighbridge/Product filters

Pins bug #13. Currently hardcodes all filters except Setting to `''`.

- [ ] Factory a report with `Filters=['Site']`. Seed weighings at two different sites. Spy on ReportingController::GetData to capture the `$data` object. Assert (currently) `$data->Site === ''` — documenting the bug. Fix task flips this.

### Task 1.15: Commit the Reporting phase, merge to Dev

- [ ] `git merge --no-ff test/phase-1-reporting`

---

## Phase 2 — Weighing Flow (core domain)

The two-stage weigh-in/weigh-out state machine. Highest business risk.

### Task 2.1: WeighingHeaderService — list filtering by site

**Files:** `tests/Unit/Services/WeighingHeaderServiceTest.php`

- [ ] Write test that verifies service-level filtering by `site_id` returns only matching headers.

### Task 2.2: WeighingHeaderService — createFirstWeight persists with status OPEN

- [ ] Assert new row, `status='OPEN'`, `FirstWeight` set, `firstWeightUserId` set, `SecondWeight` null.

### Task 2.3: WeighingHeaderService — completeSecondWeight sets status CLOSED

- [ ] Start OPEN record. Call completion. Assert `status='CLOSED'`, `SecondWeight`, `secondWeightUserId`, `updated_at` advanced.

### Task 2.4: WeighingHeaderService — TotalWeight / NettWeight formula **[SPEC NEEDED — block until PO confirms]**

**Status:** BLOCKED. The original draft said "verify by reading the actual service code first — this task may reveal intended formula." That's tautological — a test derived from the implementation can only confirm the implementation matches itself. No green signal.

**Before this task can start:**
1. Get explicit business rules from the product owner: inbound vs outbound semantics, what TotalWeight means in each case, what NettWeight subtracts (tare? moisture? both? grade deductions?).
2. Document the rules in `docs/business-rules/weighing.md`.
3. Then write the test against the documented rules, not the code.

If the PO can't be reached, lift the de-facto rule from the reporting SQL (`Sum Nett Weight = SUM(ABS(FirstWeight - SecondWeight))`) and document **that** as the assumed rule, with a sign-off request open.

### Task 2.5: WeighingHeaderService — NettWeight recalc on moisture update **[SPEC NEEDED — same as 2.4]**

The Moisture Weight formula is documented in the reporting SQL builder:
```
TotalWeight - (TotalWeight * ((100 - moisture_deduction) / NULLIF(100 - moisture_threshold, 0)))
```
Lift this as the assumed rule, but get explicit PO sign-off before locking it in via test.

### Task 2.6: WeighingHeaderService — secondWeightLoad returns OPEN for given reg number

**Files:** `tests/Feature/Weighing/SecondWeightLoadTest.php`

- [ ] Seed two headers: one OPEN one CLOSED, both same RegNumber. Hit `/secondWeightLoad?reg=ABC123`. Assert only the OPEN one returned.

### Task 2.7: Feature test — POST weighingheaders creates first-weight record

- [ ] Authenticate user. POST minimal payload. Assert DB row with correct company/site/user stamps.

### Task 2.8: Feature test — PUT weighingheaders/{id} closes transaction

- [ ] Seed OPEN. PUT close payload. Assert status CLOSED, verify output JSON.

### Task 2.9: Feature test — deletion requires reason and stamps user

Hit `POST /contract/{id}/delete` (existing deleteWithReason endpoint) or the weighing-specific delete path. Assert `deleted_at`, `reason`, `deletedUserId` all set.

### Task 2.10: WeighingCameraService — attaches camera images by workstation

**Files:** `tests/Unit/Services/WeighingCameraServiceTest.php`

- [ ] Mock HTTP via Guzzle test handler. Assert `weighingCameras` row inserted per camera attached to workstation.

### Task 2.11: WeighingCameraService — respects 3s connect / 5s total timeout

- [ ] Use a mock HTTP server that sleeps 10s. Assert service returns gracefully in ~5s, logs the timeout, does not hang.

### Task 2.12: WeighingTransactionService — attaches workstation to header

- [ ] Feature test: on first weight, assert `weighingtransactions` row created linking workstation and header.

### Task 2.13: WeighingHeaderService — AS400 export gate

Pins the guard fixed in commit `3addcfb`.

- [ ] With `settings.export_AS400='true'` expect export call. With `null` or `''`, expect NO call and no crash. Use Mockery spy on the AS400 client.

### Task 2.14: Feature test — stdClass array-access crash on 2nd weight save

Pins commit `7433c37`.

- [ ] Replay the exact payload that triggered the bug. Assert no crash, valid response.

### Task 2.15: Feature test — cURL timeouts for camera fetching

- [ ] Matches commit `bd35e2e`. Spin a stub HTTP server that holds the connection. Assert 5s timeout enforced.

### Task 2.16: Unit test — tare lookup and deduction

- [ ] Seed Tare rows for RegNumber. Trigger weighing create. Assert auto-tare value applied to NettWeight.

### Task 2.17: Unit test — pallet deduction (deleteWithReason path)

- [ ] Assert pallet soft-delete with reason, audit user stamped.

### Task 2.18: Feature test — Grade selection on first weight persists

- [ ] POST with `grades='{"A":30,"B":70}'`. Assert persisted string and downstream Grade column in reports.

### Task 2.19: Commit phase, merge to Dev

---

## Phase 3 — Contract Pricing

`ReportPricingSqlHelper` is already isolated — straightforward coverage.

### Task 3.1: netTonsSql produces correct numeric net-tons per measure_type

**Note on test style:** Phase 0 provides a real DB. Prefer **assert-on-result-set** over **assert-on-SQL-substring** — substring-matching breaks on equivalent-but-rewritten SQL (e.g., `* 0.001` vs `/ 1000`) without any actual behavior change.

**Files:** `tests/Feature/Services/ReportPricingSqlHelperTest.php`

- [ ] Seed a `weighingheaders` row with `NettWeight=1000` and a `sites.measure_type='kg'`. Run `SELECT (`. ReportPricingSqlHelper::netTonsSql() .`) FROM weighingheaders WHERE id=...`. Assert numeric result === 1.0.
- [ ] Repeat for `'t'` (expect 1000.0), `'g'` (expect 0.001), `'mt'`, `'tonne'`, `'tonnes'` (all 1000.0 for NettWeight=1000 — because measure_type=t means NettWeight is ALREADY in tons; multiplier is 1).
- [ ] Document the `ELSE 0.001` fallback as a deliberate kg-default with a `@group red` test that fails for `measure_type='lb'` (returns nonsense). Decision deferred to whether `lb` is a supported value.

### Task 3.2: netTonsSql fallback is 0.001 for unknown measure_types

- [ ] Assert `ELSE 0.001` present (pins current behavior — consider red test later for `lb` etc.).

### Task 3.3: unitPriceSql: snapshot price on header wins

- [ ] Full feature path: seed header with `price='1234.56'`, contract with `price=999`. Build Unit Price column. Assert 1234.56 selected.

### Task 3.4: unitPriceSql: falls back to contract when snapshot blank

- [ ] Header `price=NULL`, contract enabled, contract.price=500. Assert 500 selected.

### Task 3.5: unitPriceSql: falls back to product purchase_price for inbound

- [ ] `goods_type='1'`, no contract, product.purchase_price=750. Assert 750.

### Task 3.6: unitPriceSql: falls back to product sale_price for outbound

- [ ] `goods_type='2'`. Assert product.sale_price used.

### Task 3.7: pricingVatSql rounds to 2 decimals

- [ ] Compute manually for a row with known excl + vat%. Assert matches `ROUND(excl * vat/100, 2)`.

### Task 3.8: pricingInclVatSql = excl + vat

- [ ] Assert arithmetic identity against manual calculation.

### Task 3.9: Packaging / Shipping columns use header snapshots

- [ ] Seed header with `contract_packaging_price_per_ton=50`, `contract_shipping_price_per_ton=30`. Assert both columns render expected amounts.

### Task 3.10: Red test — weighingheaders.price with locale format

Pins speculative bug #25. Price stored as `"1 234,56"`. Assert CAST AS DECIMAL ≠ intended value.

### Task 3.11: Commit phase

---

## Phase 4 — Xero Sync

Existing `XeroSyncMirrorRulesTest` covers rules. This expands to the actual sync service + rate-limiting fix from commit `04cbfc1`.

### Task 4.1: XeroSyncService — contact push happy path **[use cassette, not pure mock]**

**Note on test style for Xero phase:** prefer **recorded cassettes** (real Xero responses captured once, replayed on every test run) over plain mocks. Mocks pin "the call was made with X arguments" — the *implementation*. Cassettes pin "given a real Xero response Y, our local DB ends up in state Z" — the *contract*. When Xero changes its API, cassettes catch the drift; mocks happily stay green while production breaks.

**Tooling:** either install `php-vcr/php-vcr` (composer require --dev), or hand-roll JSON fixtures under `tests/fixtures/xero/<endpoint>-<scenario>.json`.

- [ ] Capture one real Xero `POST /Contacts` response into `tests/fixtures/xero/contacts-create-success.json`.
- [ ] Test: factory a BusinessPartner; configure HTTP client to return the cassette for `POST /Contacts`; call service; assert (a) the cassette WAS hit (HTTP client recorded the request), (b) the local row's `xero_contact_id` matches the ID in the cassette response.

### Task 4.2: XeroSyncService — contact pull honors archived status **[use cassette]**

- [ ] Capture an archived-contact `GET /Contacts/{id}` response.
- [ ] Test: replay; assert local BP archived/soft-deleted per `XeroSyncMirrorRules`.

### Task 4.3: XeroSyncService — item inactive when both sold+purchased false

- [ ] Builds on existing mirror rules unit. Add feature-level test that DB state matches after pull.

### Task 4.4: Invoice sync — updated_at bug regression

Pins commit `97ddf63`.

- [ ] Replay the exact scenario. Assert `updated_at` is preserved/advanced correctly.

### Task 4.5: Rate-limiting backoff — 429 triggers exponential retry

Pins commit `04cbfc1`.

- [ ] Mock Xero client to throw 429 on first call, succeed on second. Assert retry fired, total call count = 2, latency ~ backoff.

### Task 4.6: Null product_id in invoice push does not crash

Pins the ReportingController-adjacent null crash in commit `04cbfc1`.

### Task 4.7: Sync logging writes to expected log channel

### Task 4.8: Sync direction OFF suppresses all API calls

- [ ] Set `SYNC_OFF`. Assert no Xero SDK method invocations.

### Task 4.9: Strict pull mode deletes local rows not in Xero

### Task 4.10: Standard pull mode archives only

### Task 4.11: XeroCallbackController — OAuth handshake (no JWT, highest tenant-mixup risk)

- [ ] **`GET xero/callback`** — feature test asserts state token validation, code exchange, tenant binding to the correct user. Mock the Xero OAuth response with a recorded JSON cassette.
- [ ] **`GET xero/select-tenant`** — assert UI renders only tenants the OAuth response actually returned (no leakage).
- [ ] **`POST xero/confirm-tenant-switch`** — assert the confirmed tenant is what the user picked, not what was in the original OAuth payload (TOCTOU).
- [ ] **State-token replay** — replay a used state token; assert rejection.

### Task 4.12: Commit phase

---

## Phase 5 — AS400 Export

### Task 5.1: AS400 export gate — null setting = no export

Covered partly in Task 2.13; add a dedicated boundary test on the actual exporter service (not just the header service).

### Task 5.2: AS400 export gate — empty string = no export

### Task 5.3: AS400 export gate — `'false'` string = no export

### Task 5.4: AS400 export — `'true'` string triggers the builder

- [ ] Mock AS400 client. Assert payload mapped from weighing header.

### Task 5.5: AS400 export — payload schema matches legacy format

- [ ] Snapshot test: assert JSON/fixed-width output bytes match a known-good sample.

### Task 5.6: Commit phase

---

## Phase 6 — Auth / JWT

### Task 6.1: AuthController — login happy path returns JWT

### Task 6.2: Login rejects bad password

### Task 6.3: Login rejects non-existent user

### Task 6.4: Authenticated routes accept valid token

- [ ] Hit any resource route with issued token. Assert 200.

### Task 6.5: Routes reject missing token with 401

### Task 6.6: Routes reject expired token

- [ ] Build token with `exp` in the past. Assert 401.

### Task 6.7: JWTAuth user() returns the authenticated model

### Task 6.8: Logout invalidates the token (if endpoint exists — verify routes first)

### Task 6.9: Commit phase

---

## Phase 7 — Cameras

### Task 7.1: CameraController — listing by site

### Task 7.2: Camera image fetch — 3s connect timeout

### Task 7.3: Camera image fetch — 5s total timeout

### Task 7.4: Camera image fetch — returns null on HTTP error (no crash)

### Task 7.5: getImageFromIpString validates IP format

### Task 7.6: npr.php / cam_pic.php legacy endpoints (if still used — verify first)

### Task 7.7: Commit phase

---

## Phase 8 — Settings & Custom Fields

### Task 8.1: SettingsController — per-company listing

### Task 8.2: Custom field 1–20 slots round-trip intact

- [ ] POST settings with user_defined_name1..20. GET. Assert all 20 preserved.

### Task 8.3: user_defined_rep toggles Custom column inclusion in reports

### Task 8.4: Settings updateImage persists image blob

### Task 8.5: Contract_enabled flag flips contract price resolution

### Task 8.6: Goods_type '1' vs '2' switches purchase/sale price in reports

### Task 8.7: Commit phase

---

## Phase 9 — Cron / Mailables / Commands

### Task 9.1: `reporting:email` command invokes ReportEmailer

### Task 9.2: `reporting:email` with bad ID returns non-zero

### Task 9.3: Red test — `reporting:email` silently swallows exceptions

Pins bug #17. Currently catches and returns `-1` with Log::error commented out.

### Task 9.4: SendDailyEmail command fires mailable

### Task 9.5: Report mailable — attaches CSV per weighing type

### Task 9.6: Red test — Report mailable early-returns on fopen failure, dropping later attachments

Pins bug #20.

### Task 9.7: Red test — Report mailable overwrites CSV on concurrent runs

Pins bug #18. Use file-system lock collision; assert both files exist with distinct content.

### Task 9.8: Commit phase

---

## Phase 10 — Resource Controller CRUD Smoke Suite

One smoke test per controller: list, show, store, update, destroy all return the correct status codes and persist/return the expected payload. These are cheap regression nets.

### Task 10.1: ContractsController CRUD
### Task 10.2: ContractTransactionsController CRUD
### Task 10.3: BusinessPartnerController CRUD
### Task 10.4: HaulierController CRUD
### Task 10.5: ProductController CRUD
### Task 10.6: WeighbridgeController CRUD
### Task 10.7: WorkStationsController CRUD
### Task 10.8: SiteController CRUD
### Task 10.9: CompanyController CRUD
### Task 10.10: UserController CRUD
### Task 10.11: UserTypeController CRUD
### Task 10.12: UserWorkstationController CRUD
### Task 10.13: TareController CRUD
### Task 10.14: PalletController CRUD
### Task 10.15: GradeController CRUD
### Task 10.16: AxelTypesController CRUD
### Task 10.17: AxelSetupsController CRUD
### Task 10.18: ErrorLogController CRUD
### Task 10.19: ExceptionsController CRUD
### Task 10.20: CameraController CRUD
### Task 10.21: RFIDVehicleController CRUD
### Task 10.22: TimeAndDateController set endpoint

### Task 10.23: Non-CRUD endpoints — explicit per-route tests (was: "use the template")

The Phase 10 template only covers RESTful resource controllers. These routes don't fit the pattern and need dedicated tests:

- [ ] **`POST contract/{id}/delete`** (deleteWithReason) — assert reason persisted, deletedUserId stamped, soft-delete (not hard-delete)
- [ ] **`POST pallets/{id}/delete`** (deleteWithReason) — same shape
- [ ] **`POST weighingheaders/{id}/delete`** (if present — verify routes/api.php first) — same shape, plus assert audit trail
- [ ] **`POST timeAndDate`** — if it actually mutates server time, mark as `@group destructive` and skip in CI; if it only echoes, smoke only
- [ ] **`POST getImageFromIpString`** — feature test with mocked HTTP client (use Guzzle handler stack); assert 5s timeout enforced (re-uses Phase 7 mock helper)
- [ ] **`POST updateImage`** — multipart upload, assert MIME type validation (jpg/png only), file size cap (1MB?), persisted to expected path
- [ ] **`GET secondWeightLoad`** — assert returns only OPEN headers for given RegNumber; N+1 detector
- [ ] **`GET weighingLoad`**, **`GET weighingAdd`** — sanity smoke + N+1 detector
- [ ] **`GET vehicle-lookup`** (RFID) — stub RFID model, assert lookup by tag returns expected vehicle
- [ ] **`POST esp32/relay`**, **`GET esp32/relay`** — hardware proxy; mock the HTTP target, assert correct payload passed through

### Task 10.24: cam_pic.php and npr.php — outside Laravel router

These two PHP files at the **repo root** are public-routed by nginx, bypassing both Laravel's router AND the JWT middleware. High risk surface.

- [ ] **`cam_pic.php`** — read the file. If it accepts user input (likely IP/path params), feature test with `$this->call('GET', '/cam_pic.php?...')` — wait, this won't work because it's not a Laravel route. Instead: feature test via real HTTP call against a running app container (or refactor to a Laravel controller and route — separate task).
- [ ] **`npr.php`** — same.
- [ ] **Recommendation:** if you can't easily test these, file a refactor task to move them into Laravel routes/controllers. Untested public PHP files are a security and reliability risk.

### Task 10.25: Commit phase



**Reusable template** — every task follows this shape:

```php
<?php

namespace Tests\Feature\Controllers;

use App\Models\<Model>;
use Tests\Feature\FeatureTestCase;

class <Model>ControllerCrudTest extends FeatureTestCase
{
    public function test_index_returns_rows(): void
    {
        <Model>::factory()->count(3)->create();
        $this->jsonAuthed('GET', '/api/<route>')->assertOk()->assertJsonCount(3);
    }

    public function test_store_creates_row(): void
    {
        $payload = <Model>::factory()->make()->toArray();
        $this->jsonAuthed('POST', '/api/<route>', $payload)->assertOk();
        $this->assertDatabaseHas('<table>', ['<unique_field>' => $payload['<unique_field>']]);
    }

    public function test_show_returns_row(): void
    {
        $row = <Model>::factory()->create();
        $this->jsonAuthed('GET', "/api/<route>/{$row->id}")->assertOk()->assertJsonFragment(['id' => $row->id]);
    }

    public function test_update_modifies_row(): void
    {
        $row = <Model>::factory()->create();
        $this->jsonAuthed('PUT', "/api/<route>/{$row->id}", ['<field>' => 'new'])->assertOk();
        $this->assertDatabaseHas('<table>', ['id' => $row->id, '<field>' => 'new']);
    }

    public function test_destroy_soft_deletes(): void
    {
        $row = <Model>::factory()->create();
        $this->jsonAuthed('DELETE', "/api/<route>/{$row->id}")->assertOk();
        $this->assertSoftDeleted('<table>', ['id' => $row->id]);
    }
}
```

---

## Phase 11 — Regression & Security

### Task 11.1: Pinned regressions

Write one test per bugfix commit on `master`/`Dev`:

- [ ] `3addcfb` — AS400 null guard
- [ ] `7433c37` — stdClass array crash on 2nd weight save
- [ ] `41974b0` — (inspect recent commits for pinnable behaviors)
- [ ] `bd35e2e` — Camera cURL timeouts
- [ ] `a6545f2` — QA merge behaviors worth pinning
- [ ] `04cbfc1` — Xero 429, ReportingController null crash
- [ ] `8fd2f58` — Null Columns guard
- [ ] Previous Nett-Weight alignment commit we just made
- [ ] Previous Moisture NULLIF commit
- [ ] Previous Exception filter fix
- [ ] Previous weight-unit space fix

Each gets a dedicated red→green test.

### Task 11.2: SQL-injection regression tests

Even though "not concerned" per project constraints — add these so new code paths can't silently introduce worse surfaces. Only hit the non-quoted filter params with payloads containing `'`.

- [ ] Hit edit endpoint with `site_id='; DROP TABLE sites;--`. Assert response is 500/400, sites table intact.
- [ ] Repeat for the other 6 interpolated filters.

These should currently fail loudly (or silently succeed with bad data) — either way, valuable regression signal.

### Task 11.3: Authorization — cross-company isolation

- [ ] Create two companies, log in as company A user, hit a company-B-only resource id. Assert 403/404 (or document currently-open behavior as a red test).

### Task 11.4: Rate limiting / input size guards

- [ ] POST 10MB payload to any endpoint. Assert 413 or bounded behavior.

### Task 11.5: Cross-cutting concerns

- [ ] **Middleware: every API route requires auth** — write a single test that walks `Route::getRoutes()`, hits each `api/*` URL with no token, asserts 401. One test catches an entire class of bug.
- [ ] **Exception handler does not leak stack traces in production** — feature test with `APP_DEBUG=false`, force a 500, assert response body does NOT contain file paths or class names.
- [ ] **Queue workers actually drain** — if any mailable/job is queued (`should_queue` etc.), test asserts `Queue::fake()` recorded the dispatch AND that running `php artisan queue:work --once` processes it cleanly.
- [ ] **`ErrorLog` model usage** — every controller-level catch block should write to ErrorLog. Pick 3 representative controllers, force an exception in each, assert an ErrorLog row was created.
- [ ] **Migration round-trip** — `php artisan migrate:fresh && php artisan migrate:rollback` both succeed without errors. Catches missing `down()` methods.

### Task 11.6: Commit phase

---

## Phase 12 — Coverage, Mutation, CI Polish

### Task 12.1: Enable phpunit coverage output

- [ ] Add `<coverage>` to phpunit.xml, produce Cobertura XML.

### Task 12.2: Publish coverage in Azure Pipelines

- [ ] `PublishCodeCoverageResults@1` task with Cobertura format.

### Task 12.3: Set a minimum coverage gate

- [ ] Start at 20% (realistic given code age). Ratchet over time.

### Task 12.4: Optional — Infection mutation testing on Services layer

- [ ] Add `infection/infection` to require-dev. Run against `app/Services/` only. Aim for MSI ≥ 50% in that layer.

### Task 12.5: Commit phase, merge to Dev, celebrate

---

## Task count & time estimate (revised after multi-angle review)

- Phase 0 (Infra): **22 tasks, ~7 days** — added 0.20 SQL scripts smoke, 0.21 cross-company helper, 0.12 split into a/b/c. Schema bootstrap (0.3) is the riskiest single task.
- Phase R (Refactor): 15 tasks, **~5 days** — R.13 alone is now 5 explicit steps coordinated with R.10 + Kernel.php edit; R.6 became "extract ReportDataBuilder" instead of risky controller injection.
- Phase 1: 15 tasks, ~3 days
- Phase 2: **19 tasks, ~6 days** — Tasks 2.4/2.5 BLOCKED on PO sign-off; budget includes back-and-forth.
- Phase 3: 11 tasks, ~3 days — switched from SQL substring tests to result-set tests (slightly more setup, much more durable).
- Phase 4: **15 tasks, ~6 days** — added 4.11 XeroCallbackController; tests use recorded cassettes (more reliable, more setup).
- Phase 5: 6 tasks, ~1 day
- Phase 6: 9 tasks, ~1.5 days
- Phase 7: 7 tasks, ~1.5 days
- Phase 8: 7 tasks, ~1.5 days
- Phase 9: 8 tasks, ~2 days
- Phase 10: **30 tasks, ~5 days** — added 10.23 non-CRUD endpoints (~10 routes), 10.24 cam_pic.php/npr.php.
- Phase 11: **10 tasks, ~3 days** — added 11.5 cross-cutting (middleware audit, exception handler shape, queue drain, ErrorLog usage, migration round-trip).
- Phase 12: 5 tasks, ~1 day

**Total: ~190 tasks, ~46 engineer-days nominal.**

Apply the standard 1.6× contingency for greenfield tests on legacy code:

- **One engineer, full-time, no interruptions: 14–18 weeks.**
- **Two engineers in parallel: 8–10 weeks.** Phase 0 + R must serialize (~3 weeks); Phases 1–12 parallelize cleanly by subsystem.
- **One engineer at 50% (realistic for single-maintainer shop): 7+ months.**

If 14–18 weeks is unworkable, fall back to the 4–5 week MVP scope (Phase 0 + R + 2 + 11.1) — test the highest-risk subsystem (weighing flow) and pin shipped bug regressions; defer breadth.

---

## Self-review (per writing-plans skill)

**Spec coverage:** Every top-level subsystem called out in the parent conversation is addressed. Bug list from earlier analysis (#1, #6, #11, #13, #15, #17, #18, #20) has a dedicated regression task in Phase 9/11.

**Placeholders:** Searched for "TBD", "TODO", "similar to task" — none remain in Phases 0, 1, 2, 3. Phases 5–10 intentionally use the CRUD template (DRY) with per-controller routing details left to be filled in by the implementer from `routes/api.php` — this is a judgment call: the routes are self-documenting and duplicating them in the plan doubles plan size without adding clarity. If the implementer wants them inline, split Phase 10 into individual detailed tasks.

**Type consistency:** `Reporting::factory()->withDefinition()`, `ReportDefinitionBuilder::transaction()`, `FeatureTestCase::jsonAuthed()`, `TruncatesDatabase::truncateAllTables()` — signatures consistent across all phases.

**Known risk:** Phase 0 Task 0.3's `migrate:fresh` at bootstrap is the riskiest assumption. If the Laravel migrations aren't authoritative (because `database_scripts/*.sql` is the real source of truth on prod), feature tests may diverge from production. If this becomes a problem, replace `migrate:fresh` with a bash step that concatenates and executes `database_scripts/*.sql` against the test DB before phpunit runs.
