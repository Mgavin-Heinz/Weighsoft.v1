<?php

namespace App\Support;

class XeroInvoiceId
{
    private const ZERO_GUID = '00000000-0000-0000-0000-000000000000';

    public static function isUsable(?string $invoiceId): bool
    {
        if (!is_string($invoiceId)) {
            return false;
        }

        $trimmed = trim($invoiceId);
        if ($trimmed === '') {
            return false;
        }

        return strtolower($trimmed) !== self::ZERO_GUID;
    }

    public static function isZeroGuid(?string $invoiceId): bool
    {
        if (!is_string($invoiceId)) {
            return false;
        }

        return strtolower(trim($invoiceId)) === self::ZERO_GUID;
    }
}
