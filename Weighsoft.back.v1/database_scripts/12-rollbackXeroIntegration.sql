-- =====================================================
-- XERO INTEGRATION - ROLLBACK SCRIPT (Script 12)
-- Reverses all changes from 12-addXeroIntegration.sql
-- Safe to run multiple times - checks before dropping
-- =====================================================

USE weighsoft;

START TRANSACTION;

-- =====================================================
-- 1. REMOVE xero_invoice_id FROM weighingheaders
-- =====================================================
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'weighingheaders'
      AND INDEX_NAME = 'idx_wh_xero_invoice'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `weighingheaders` DROP INDEX `idx_wh_xero_invoice`',
    'SELECT "✓ idx_wh_xero_invoice already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'weighingheaders'
      AND COLUMN_NAME = 'xero_invoice_id'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `weighingheaders` DROP COLUMN `xero_invoice_id`',
    'SELECT "✓ weighingheaders.xero_invoice_id already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'weighingheaders'
      AND COLUMN_NAME = 'invoice_modified'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `weighingheaders` DROP COLUMN `invoice_modified`',
    'SELECT "✓ weighingheaders.invoice_modified already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 2. REMOVE xero_item_id FROM products
-- =====================================================
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND INDEX_NAME = 'idx_prod_xero_item'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `products` DROP INDEX `idx_prod_xero_item`',
    'SELECT "✓ idx_prod_xero_item already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'xero_synced_at'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `products` DROP COLUMN `xero_synced_at`',
    'SELECT "✓ products.xero_synced_at already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'xero_item_id'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `products` DROP COLUMN `xero_item_id`',
    'SELECT "✓ products.xero_item_id already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. REMOVE xero_contact_id FROM businesspartners
-- =====================================================
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'businesspartners'
      AND INDEX_NAME = 'idx_bp_xero_contact'
);

SET @sql = IF(@index_exists > 0,
    'ALTER TABLE `businesspartners` DROP INDEX `idx_bp_xero_contact`',
    'SELECT "✓ idx_bp_xero_contact already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'businesspartners'
      AND COLUMN_NAME = 'xero_synced_at'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `businesspartners` DROP COLUMN `xero_synced_at`',
    'SELECT "✓ businesspartners.xero_synced_at already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'businesspartners'
      AND COLUMN_NAME = 'xero_contact_id'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `businesspartners` DROP COLUMN `xero_contact_id`',
    'SELECT "✓ businesspartners.xero_contact_id already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. DROP xero_invoice_queue TABLE
-- =====================================================
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
);

SET @sql = IF(@table_exists > 0,
    'DROP TABLE `xero_invoice_queue`',
    'SELECT "✓ xero_invoice_queue already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 5. DROP xero_sync_log TABLE
-- =====================================================
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_sync_log'
);

SET @sql = IF(@table_exists > 0,
    'DROP TABLE `xero_sync_log`',
    'SELECT "✓ xero_sync_log already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 6. DROP xero_settings TABLE
-- =====================================================
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_settings'
);

SET @sql = IF(@table_exists > 0,
    'DROP TABLE `xero_settings`',
    'SELECT "✓ xero_settings already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 7. REMOVE xero PERMISSION FROM usertypes
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usertypes'
      AND COLUMN_NAME = 'xero'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `usertypes` DROP COLUMN `xero`',
    'SELECT "✓ usertypes.xero already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- NOTE: jobs and failed_jobs tables are NOT dropped here
-- as they may be used by other features. Uncomment below if needed:
-- DROP TABLE IF EXISTS `failed_jobs`;
-- DROP TABLE IF EXISTS `jobs`;

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT '========================================' as '';
SELECT 'XERO ROLLBACK - VERIFICATION RESULTS' as '';
SELECT '========================================' as '';

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ xero_settings REMOVED'
        ELSE '✗ xero_settings STILL EXISTS'
    END as Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_settings';

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ xero_sync_log REMOVED'
        ELSE '✗ xero_sync_log STILL EXISTS'
    END as Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_sync_log';

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ xero_invoice_queue REMOVED'
        ELSE '✗ xero_invoice_queue STILL EXISTS'
    END as Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_invoice_queue';

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ businesspartners.xero_contact_id REMOVED'
        ELSE '✗ businesspartners.xero_contact_id STILL EXISTS'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'businesspartners'
  AND COLUMN_NAME = 'xero_contact_id';

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ products.xero_item_id REMOVED'
        ELSE '✗ products.xero_item_id STILL EXISTS'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME = 'xero_item_id';

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ weighingheaders.xero_invoice_id REMOVED'
        ELSE '✗ weighingheaders.xero_invoice_id STILL EXISTS'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'weighingheaders'
  AND COLUMN_NAME = 'xero_invoice_id';

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ weighingheaders.invoice_modified REMOVED'
        ELSE '✗ weighingheaders.invoice_modified STILL EXISTS'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'weighingheaders'
  AND COLUMN_NAME = 'invoice_modified';

SELECT
    CASE
        WHEN COUNT(*) = 0 THEN '✓ usertypes.xero REMOVED'
        ELSE '✗ usertypes.xero STILL EXISTS'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'usertypes'
  AND COLUMN_NAME = 'xero';

SELECT '========================================' as '';
SELECT 'All checks should show ✓' as '';
SELECT 'If any show ✗, contact support' as '';
SELECT '========================================' as '';
