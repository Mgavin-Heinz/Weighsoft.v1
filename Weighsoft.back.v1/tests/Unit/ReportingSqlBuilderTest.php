<?php

namespace Tests\Unit;

use App\Http\Controllers\ReportingController;
use ReflectionClass;
use Tests\TestCase;

class ReportingSqlBuilderTest extends TestCase
{
    /**
     * Invoke ReportingController::buildReportSql with a fake $Reporting definition
     * and runtime $data, without touching the database.
     *
     * @param  array  $reportingDef   {Columns, Filters, Groupings, ReportType} — decoded jsondata shape.
     * @param  array  $dataOverrides  Fields to override on the default $data object.
     * @param  array  $reportOverrides Fields to override on the report row array.
     * @return array  {sql: ?string, needsGroupToggle: bool, abortWith: ?array}
     */
    private function build(array $reportingDef, array $dataOverrides = [], array $reportOverrides = []): array
    {
        $controller = new ReportingController();

        $reflection = new ReflectionClass($controller);
        $prop = $reflection->getProperty('Reporting');
        $prop->setAccessible(true);
        $prop->setValue($controller, json_decode(json_encode($reportingDef)));

        $data = (object) array_merge([
            'id' => 1,
            'Site' => '', 'Setting' => '', 'Workstation' => '', 'Weighbridge' => '',
            'Product' => '', 'Businesspartner' => '', 'Haulier' => '', 'Exception' => '',
            'stockpile_nr' => '', 'destination' => '', 'order_numbers' => '',
            'DateRange' => null,
        ], $dataOverrides);

        $report = array_merge([
            'id' => 1,
            'show_deleted' => 'No',
            'jsondata' => json_encode($reportingDef),
        ], $reportOverrides);

        return $controller->buildReportSql($data, $report);
    }

    public function test_filters_plus_groupings_produces_no_dangling_and_before_group_by(): void
    {
        $result = $this->build([
            'Columns' => ['Site'],
            'Filters' => ['Site'],
            'Groupings' => ['Site'],
            'ReportType' => ['value' => 'transaction'],
        ], ['Site' => '5']);

        $this->assertNull($result['abortWith']);
        $this->assertStringNotContainsString('and  group by', $result['sql']);
        $this->assertStringNotContainsString('and group by', $result['sql']);
        $this->assertStringContainsString('group by', $result['sql']);
    }

    public function test_missing_date_range_when_filter_configured_returns_abort_payload(): void
    {
        $result = $this->build([
            'Columns' => ['Site'],
            'Filters' => ['Date Range'],
            'Groupings' => [],
            'ReportType' => ['value' => 'transaction'],
        ], ['DateRange' => null]);

        $this->assertNotNull($result['abortWith']);
        $this->assertNull($result['sql']);
        $this->assertArrayHasKey('Error', $result['abortWith']);
        $this->assertStringContainsString('DateRange', $result['abortWith']['Error']);
    }

    public function test_row_level_and_sum_nett_weight_use_matching_formula(): void
    {
        $result = $this->build([
            'Columns' => ['Nett Weight', 'Sum Nett Weight'],
            'Filters' => [],
            'Groupings' => [],
            'ReportType' => ['value' => 'transaction'],
        ]);

        $this->assertStringContainsString('ROUND(ABS(FirstWeight - SecondWeight)', $result['sql']);
        $this->assertStringContainsString('sum(ABS(FirstWeight - SecondWeight))', $result['sql']);
        $this->assertStringNotContainsString('ROUND(NettWeight', $result['sql']);
    }

    public function test_moisture_weight_guards_divide_by_zero_when_threshold_is_100_percent(): void
    {
        // RED — pins bug #11.
        // Current Dev emits "(100-moisture_threshold)" as a divisor. If moisture_threshold
        // is stored as 100, MySQL returns NULL for the division which propagates through
        // CONCAT and silently produces a NULL cell. Expected fix: wrap the divisor with
        // NULLIF(100 - moisture_threshold, 0) or gate with an IF.
        $result = $this->build([
            'Columns' => ['Moisture Weight'],
            'Filters' => [],
            'Groupings' => [],
            'ReportType' => ['value' => 'transaction'],
        ]);

        $this->assertMatchesRegularExpression(
            '/NULLIF\s*\(\s*100\s*-\s*moisture_threshold/i',
            $result['sql'],
            'Moisture Weight SQL should guard the (100 - moisture_threshold) divisor against zero.'
        );
    }

    public function test_weight_columns_emit_space_between_value_and_unit(): void
    {
        // RED — pins bug #6.
        // QA builds weight columns as Concat(ROUND(x, dec), ' ', unit) producing "1234 KG".
        // Dev dropped the ' ' literal so output is "1234KG". This test asserts the space
        // separator is present for Gross Weight (representative of all weight columns).
        $result = $this->build([
            'Columns' => ['Gross Weight'],
            'Filters' => [],
            'Groupings' => [],
            'ReportType' => ['value' => 'transaction'],
        ]);

        $this->assertStringContainsString(
            "), ' ', IFNULL((select measure_type",
            $result['sql'],
            'Weight column Concat should include a literal space between the rounded value and the measure_type subquery.'
        );
    }

    public function test_exception_type_filter_fires_on_exception_value_not_product_value(): void
    {
        // RED — pins bug #1.
        // Line ~426 guards on ($data->Product ?? '') !== '' but interpolates $data->Exception.
        // Correct behavior: the filter should fire based on Exception value, not Product.
        $result = $this->build([
            'Columns' => [],
            'Filters' => ['Exception Type'],
            'Groupings' => [],
            'ReportType' => ['value' => 'exception'],
        ], ['Exception' => 'E001', 'Product' => '']);

        $this->assertStringContainsString(
            "code = 'E001'",
            $result['sql'],
            'Exception Type filter should emit code = :exceptionValue when Exception is provided, independent of Product.'
        );
    }

    public function test_no_filters_no_groupings_builds_valid_select_from_weighingheaders(): void
    {
        $result = $this->build([
            'Columns' => ['Transaction No'],
            'Filters' => [],
            'Groupings' => [],
            'ReportType' => ['value' => 'transaction'],
        ]);

        $this->assertNull($result['abortWith']);
        $this->assertStringContainsString('from weighingheaders', $result['sql']);
        $this->assertStringContainsString('status = \'CLOSED\'', $result['sql']);
        // No trailing " and" / "," / trailing space after final cleanup.
        $this->assertDoesNotMatchRegularExpression('/\s+and\s*$/i', $result['sql']);
        $this->assertStringEndsNotWith(',', $result['sql']);
    }

    public function test_custom_fields_silently_dropped_when_runtime_setting_missing(): void
    {
        // Documents existing behavior: Custom Fields column disappears from SELECT when
        // the Weighing Types filter is configured but no weighingtypes_id was sent at
        // runtime. This is a latent bug (silent data loss) but not currently in scope
        // to fix — test pins the behavior so any future change is deliberate.
        $result = $this->build([
            'Columns' => ['Custom Fields', 'Site'],
            'Filters' => ['Weighing Types'],
            'Groupings' => [],
            'ReportType' => ['value' => 'transaction'],
        ], ['Setting' => '']);

        $this->assertStringNotContainsString('Custom1', $result['sql']);
        $this->assertStringNotContainsString('Custom Fields', $result['sql']);
    }
}
