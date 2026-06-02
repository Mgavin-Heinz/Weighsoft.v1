<?php

namespace App\Services;

/**
 * NettWeight on weighing headers is stored in the site's display unit (kg, t/mt, g).
 * Product and contract prices are per metric ton.
 */
final class WeighingNetToMetricTons
{
    public static function normalizeMeasureType(?string $measureType): string
    {
        if ($measureType === null || trim($measureType) === '') {
            return 'kg';
        }
        $s = strtolower(trim($measureType));
        if (in_array($s, ['t', 'mt', 'ton', 'tons', 'tonne', 'tonnes'], true)) {
            return 't';
        }

        return $s;
    }

    public static function fromStoredNet(float $net, ?string $measureType): float
    {
        $m = self::normalizeMeasureType($measureType);
        if ($m === 't') {
            return $net;
        }
        if ($m === 'g') {
            return $net / 1_000_000;
        }

        return $net / 1000;
    }
}
