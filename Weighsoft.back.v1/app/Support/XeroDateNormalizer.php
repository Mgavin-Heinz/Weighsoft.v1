<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use DateTimeInterface;

class XeroDateNormalizer
{
    /**
     * Normalize Xero date inputs to UTC datetime string for DB writes.
     */
    public static function toUtcDateTimeString(mixed $value): ?string
    {
        $date = self::parse($value);
        return $date ? $date->toDateTimeString() : null;
    }

    /**
     * Accept DateTime, epoch (sec/ms), ISO strings and /Date(ms+offset)/.
     */
    public static function parse(mixed $value): ?CarbonImmutable
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return CarbonImmutable::instance($value)->utc();
        }

        if (is_int($value) || (is_string($value) && preg_match('/^-?\d+$/', $value))) {
            return self::fromEpoch((int) $value);
        }

        if (is_string($value)) {
            $trimmed = trim($value);
            $normalized = str_replace('\/', '/', $trimmed);

            if (preg_match('#^/Date\(([-+]?\d+)([+-]\d{4})?\)/$#', $normalized, $matches)) {
                return self::fromXeroSerialized($matches);
            }

            try {
                return CarbonImmutable::parse($normalized)->utc();
            } catch (\Throwable) {
                return null;
            }
        }

        return null;
    }

    private static function fromEpoch(int $epoch): CarbonImmutable
    {
        $isMilliseconds = strlen((string) abs($epoch)) >= 13;
        $seconds = $isMilliseconds ? intdiv($epoch, 1000) : $epoch;
        $milliseconds = $isMilliseconds ? ($epoch % 1000) : 0;

        if ($milliseconds < 0) {
            $seconds -= 1;
            $milliseconds += 1000;
        }

        $date = CarbonImmutable::createFromTimestampUTC($seconds);
        return $milliseconds > 0 ? $date->addMilliseconds($milliseconds) : $date;
    }

    private static function fromXeroSerialized(array $matches): ?CarbonImmutable
    {
        $milliseconds = (int) $matches[1];
        return self::fromEpoch($milliseconds)->utc();
    }
}
