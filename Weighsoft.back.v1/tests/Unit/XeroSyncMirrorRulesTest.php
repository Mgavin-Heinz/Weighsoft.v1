<?php

namespace Tests\Unit;

use App\Models\XeroSettings;
use App\Support\XeroSyncMirrorRules;
use Tests\TestCase;
use XeroAPI\XeroPHP\Models\Accounting\Contact;

class XeroSyncMirrorRulesTest extends TestCase
{
    public function test_contact_archived_status_matches_xero_constants(): void
    {
        $this->assertTrue(XeroSyncMirrorRules::isContactArchivedStatus(Contact::CONTACT_STATUS_ARCHIVED));
        $this->assertTrue(XeroSyncMirrorRules::isContactArchivedStatus(Contact::CONTACT_STATUS_GDPRREQUEST));
        $this->assertFalse(XeroSyncMirrorRules::isContactArchivedStatus(Contact::CONTACT_STATUS_ACTIVE));
        $this->assertFalse(XeroSyncMirrorRules::isContactArchivedStatus(null));
        $this->assertFalse(XeroSyncMirrorRules::isContactArchivedStatus(''));
    }

    public function test_item_inactive_only_when_both_is_sold_and_is_purchased_are_false(): void
    {
        $this->assertTrue(XeroSyncMirrorRules::isItemInactiveBothChannelsFalse(false, false));
        $this->assertFalse(XeroSyncMirrorRules::isItemInactiveBothChannelsFalse(null, false));
        $this->assertFalse(XeroSyncMirrorRules::isItemInactiveBothChannelsFalse(false, null));
        $this->assertFalse(XeroSyncMirrorRules::isItemInactiveBothChannelsFalse(true, false));
        $this->assertFalse(XeroSyncMirrorRules::isItemInactiveBothChannelsFalse(false, true));
        $this->assertFalse(XeroSyncMirrorRules::isItemInactiveBothChannelsFalse(null, null));
    }

    public function test_xero_settings_normalized_sync_direction_allows_off_standard_pull_and_strict(): void
    {
        $this->assertSame(XeroSettings::SYNC_OFF, XeroSettings::normalizedSyncDirection(XeroSettings::SYNC_OFF));
        $this->assertSame(
            XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
            XeroSettings::normalizedSyncDirection(XeroSettings::SYNC_XERO_TO_WEIGHSOFT)
        );
        $this->assertSame(
            XeroSettings::SYNC_STRICT_XERO_TO_WEIGHSOFT,
            XeroSettings::normalizedSyncDirection(XeroSettings::SYNC_STRICT_XERO_TO_WEIGHSOFT)
        );
        $this->assertSame(
            XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
            XeroSettings::normalizedSyncDirection(XeroSettings::SYNC_BIDIRECTIONAL)
        );
        $this->assertSame(
            XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
            XeroSettings::normalizedSyncDirection(XeroSettings::SYNC_WEIGHSOFT_TO_XERO)
        );
        $this->assertSame(XeroSettings::SYNC_XERO_TO_WEIGHSOFT, XeroSettings::normalizedSyncDirection('invalid'));
    }

    public function test_xero_settings_strict_mirror_flags(): void
    {
        $strictCustomers = new XeroSettings([
            'sync_customers' => XeroSettings::SYNC_STRICT_XERO_TO_WEIGHSOFT,
            'sync_products'  => XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
        ]);
        $this->assertTrue($strictCustomers->strictMirrorCustomers());
        $this->assertFalse($strictCustomers->strictMirrorProducts());

        $strictBoth = new XeroSettings([
            'sync_customers' => XeroSettings::SYNC_XERO_TO_WEIGHSOFT,
            'sync_products'  => XeroSettings::SYNC_STRICT_XERO_TO_WEIGHSOFT,
        ]);
        $this->assertFalse($strictBoth->strictMirrorCustomers());
        $this->assertTrue($strictBoth->strictMirrorProducts());
    }
}
