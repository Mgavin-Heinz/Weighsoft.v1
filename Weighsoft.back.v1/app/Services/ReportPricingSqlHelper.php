<?php

namespace App\Services;

/**
 * SQL fragments for per-weighing pricing in reporting, aligned with weighing UI recalculatePricing:
 * base unit per ton (header snapshot, else contract override or product purchase/sale),
 * packaging/shipping from header snapshots (per ton × metric tons from NettWeight in site units),
 * excl VAT = sum of components, VAT = ROUND(excl * vat% / 100, 2), incl = excl + VAT.
 */
final class ReportPricingSqlHelper
{
    /**
     * Net weight in metric tons (NettWeight stored in site unit from sites.measure_type).
     */
    public static function netTonsSql(): string
    {
        // Searched CASE: MariaDB rejects simple "CASE (subquery-expr) WHEN 't'" in this context (1064 near WHEN).
        $mt = 'LOWER(TRIM(IFNULL((SELECT measure_type FROM sites WHERE id = weighingheaders.site_id LIMIT 1), \'\')))';

        return '(IFNULL(weighingheaders.NettWeight, 0) * (CASE '
            . 'WHEN ' . $mt . " IN ('t', 'mt', 'ton', 'tons', 'tonne', 'tonnes') THEN 1 "
            . 'WHEN ' . $mt . " = 'g' THEN 0.000001 "
            . 'ELSE 0.001 END))';
    }

    /**
     * Base unit price per ton (0 if unresolved): prefer snapshot on header, else contract/product logic.
     */
    public static function unitPriceSql(): string
    {
        return '(' . self::resolvedBaseUnitPriceSql() . ')';
    }

    /**
     * Base line amount excluding VAT.
     */
    public static function pricingBaseExclVatSql(): string
    {
        return '(' . self::resolvedBaseUnitPriceSql() . ') * ' . self::netTonsSql();
    }

    public static function pricingPackagingExclVatSql(): string
    {
        return '(IFNULL(weighingheaders.contract_packaging_price_per_ton, 0) * ' . self::netTonsSql() . ')';
    }

    public static function pricingShippingExclVatSql(): string
    {
        return '(IFNULL(weighingheaders.contract_shipping_price_per_ton, 0) * ' . self::netTonsSql() . ')';
    }

    /**
     * Line amount excluding VAT (prices per ton).
     */
    public static function pricingExclVatSql(): string
    {
        $b = self::pricingBaseExclVatSql();
        $p = self::pricingPackagingExclVatSql();
        $s = self::pricingShippingExclVatSql();

        return "(({$b}) + ({$p}) + ({$s}))";
    }

    /**
     * VAT amount for the line (rounded to 2 decimals, matching JS roundToTwo on VAT).
     */
    public static function pricingVatSql(): string
    {
        $excl = self::pricingExclVatSql();
        $vatRate = 'IFNULL((SELECT p.vat FROM products p WHERE p.id = weighingheaders.product_id LIMIT 1), 0)';

        return "ROUND(({$excl}) * ({$vatRate} / 100), 2)";
    }

    /**
     * Line total including VAT.
     */
    public static function pricingInclVatSql(): string
    {
        $excl = self::pricingExclVatSql();
        $vat = self::pricingVatSql();

        return "({$excl}) + ({$vat})";
    }

    private static function resolvedBaseUnitPriceSql(): string
    {
        $fallback = '(' . self::unitPriceScalarSubquery() . ')';

        return "CASE WHEN weighingheaders.price IS NOT NULL AND TRIM(CAST(weighingheaders.price AS CHAR)) <> '' "
            . "THEN CAST(weighingheaders.price AS DECIMAL(20, 8)) "
            . 'ELSE IFNULL(' . $fallback . ', 0) END';
    }

    private static function unitPriceScalarSubquery(): string
    {
        // MariaDB rejects outer-query references (weighingheaders.*) inside a
        // correlated subquery's JOIN ... ON clause when the report query uses
        // GROUP BY (42S22 "Unknown column ... in 'on clause'"). The previous
        // implementation joined `contract_transactions ctr ON ctr.weighing_header_id
        // = weighingheaders.id` and tripped this on Enterprise/any grouped report
        // with a pricing column. The fix below keeps the same end result — pull
        // the `ct.price` for the contract associated with this weighingheader —
        // but moves the outer reference into a NESTED scalar subquery's WHERE
        // clause, which MariaDB does accept. Same reason products are resolved
        // via scalar subqueries below.
        $purchase = '(SELECT purchase_price FROM products WHERE id = weighingheaders.product_id LIMIT 1)';
        $sale = '(SELECT sale_price FROM products WHERE id = weighingheaders.product_id LIMIT 1)';

        return <<<SQL
SELECT CASE
    WHEN IFNULL(s.contract_enabled, '') = 'true'
      AND ct.price IS NOT NULL
      AND TRIM(CAST(ct.price AS CHAR)) <> ''
      THEN ct.price
    WHEN IFNULL(s.goods_type, '') = '1' THEN {$purchase}
    ELSE {$sale}
END
FROM settings s
LEFT JOIN contracts ct ON ct.id = (
    SELECT ctr.contract_id
    FROM contract_transactions ctr
    WHERE ctr.weighing_header_id = weighingheaders.id
      AND ctr.deleted_at IS NULL
    LIMIT 1
)
WHERE s.id = weighingheaders.settings_id
LIMIT 1
SQL;
    }
}
