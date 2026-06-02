-- sync_customers / sync_products must fit 'strict_xero_to_weighsoft' (24 chars).
-- VARCHAR(20) silently truncates on save → blank UI dropdowns and strict mirror never activates.

ALTER TABLE `xero_settings`
  MODIFY COLUMN `sync_customers` VARCHAR(40) NOT NULL DEFAULT 'xero_to_weighsoft'
    COMMENT 'off, xero_to_weighsoft, strict_xero_to_weighsoft',
  MODIFY COLUMN `sync_products` VARCHAR(40) NOT NULL DEFAULT 'xero_to_weighsoft'
    COMMENT 'off, xero_to_weighsoft, strict_xero_to_weighsoft';

-- Repair values truncated to 20 chars (e.g. strict_xero_to_weighs → strict_xero_to_weighsoft)
UPDATE `xero_settings`
SET `sync_customers` = 'strict_xero_to_weighsoft'
WHERE `sync_customers` = 'strict_xero_to_weighs';

UPDATE `xero_settings`
SET `sync_products` = 'strict_xero_to_weighsoft'
WHERE `sync_products` = 'strict_xero_to_weighs';
