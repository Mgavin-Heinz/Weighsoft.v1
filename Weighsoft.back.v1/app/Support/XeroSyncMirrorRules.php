<?php

namespace App\Support;

use XeroAPI\XeroPHP\Models\Accounting\Contact;

/**
 * Pure helpers for mirroring Xero catalog state into WeighSoft (used by XeroSyncService and tests).
 */
final class XeroSyncMirrorRules
{
    public static function isContactArchivedStatus(?string $status): bool
    {
        return in_array($status, [
            Contact::CONTACT_STATUS_ARCHIVED,
            Contact::CONTACT_STATUS_GDPRREQUEST,
        ], true);
    }

    /**
     * Xero marks items unavailable for sales and purchase when both flags are explicitly false.
     * Null means "not specified in payload" — treat as active so we do not mis-delete on sparse responses.
     */
    public static function isItemInactiveBothChannelsFalse(?bool $isSold, ?bool $isPurchased): bool
    {
        return $isSold === false && $isPurchased === false;
    }
}
