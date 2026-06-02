-- =====================================================
-- XERO INTEGRATION - Database Schema Changes (Script 12)
-- Run this on your existing database to apply all changes
-- Safe to run multiple times - checks before adding
-- =====================================================

USE weighsoft;

START TRANSACTION;

-- =====================================================
-- 1. CREATE xero_settings TABLE
-- =====================================================
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_settings'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE `xero_settings` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `company_id` INT UNSIGNED NOT NULL,
        `xero_tenant_id` VARCHAR(255) NULL,
        `organization_name` VARCHAR(255) NULL,
        `access_token` TEXT NULL COMMENT ''Encrypted via Laravel Crypt'',
        `refresh_token` TEXT NULL COMMENT ''Encrypted via Laravel Crypt'',
        `token_expires_at` DATETIME NULL,
        `xero_enabled` TINYINT(1) NOT NULL DEFAULT 0,
        `sync_customers` VARCHAR(20) NOT NULL DEFAULT ''bidirectional'' COMMENT ''off, xero_to_weighsoft, weighsoft_to_xero, bidirectional'',
        `sync_products` VARCHAR(20) NOT NULL DEFAULT ''bidirectional'' COMMENT ''off, xero_to_weighsoft, weighsoft_to_xero, bidirectional'',
        `auto_create_invoices` TINYINT(1) NOT NULL DEFAULT 1,
        `invoice_action` VARCHAR(20) NOT NULL DEFAULT ''draft'' COMMENT ''draft, approved, approved_emailed'',
        `sync_frequency_minutes` INT NOT NULL DEFAULT 60,
        `currency_code` VARCHAR(3) NOT NULL DEFAULT ''ZAR'',
        `last_customer_sync_at` DATETIME NULL,
        `last_product_sync_at` DATETIME NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY `uk_xero_settings_company` (`company_id`),
        CONSTRAINT `fk_xero_settings_company` FOREIGN KEY (`company_id`)
            REFERENCES `companies`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'SELECT "✓ xero_settings table already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 2. CREATE xero_sync_log TABLE
-- =====================================================
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_sync_log'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE `xero_sync_log` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `company_id` INT UNSIGNED NOT NULL,
        `sync_type` ENUM(''customers'', ''products'', ''invoice'', ''email'') NOT NULL,
        `direction` ENUM(''push'', ''pull'', ''both'') NOT NULL DEFAULT ''both'',
        `status` ENUM(''success'', ''failed'', ''pending'') NOT NULL,
        `records_synced` INT NOT NULL DEFAULT 0,
        `error_message` TEXT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_xero_sync_log_company` (`company_id`),
        INDEX `idx_xero_sync_log_created` (`created_at`),
        CONSTRAINT `fk_xero_sync_log_company` FOREIGN KEY (`company_id`)
            REFERENCES `companies`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'SELECT "✓ xero_sync_log table already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. CREATE xero_invoice_queue TABLE
-- =====================================================
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE `xero_invoice_queue` (
        `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `weighing_header_id` BINARY(16) NOT NULL,
        `company_id` INT UNSIGNED NOT NULL,
        `ticket_number` VARCHAR(255) NULL,
        `customer_name` VARCHAR(255) NULL,
        `product_name` VARCHAR(255) NULL,
        `net_weight` DECIMAL(12,2) NULL,
        `xero_invoice_id` VARCHAR(255) NULL,
        `xero_invoice_number` VARCHAR(255) NULL,
        `status` ENUM(''pending'',''processing'',''sent'',''approved'',''emailed'',''failed'')
            NOT NULL DEFAULT ''pending'',
        `retry_count` INT NOT NULL DEFAULT 0,
        `max_retries` INT NOT NULL DEFAULT 5,
        `error_message` TEXT NULL,
        `last_retry_at` DATETIME NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY `uk_xero_invoice_header` (`weighing_header_id`),
        INDEX `idx_xero_invoice_company` (`company_id`),
        INDEX `idx_xero_invoice_status` (`status`),
        CONSTRAINT `fk_xero_invoice_company` FOREIGN KEY (`company_id`)
            REFERENCES `companies`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'SELECT "✓ xero_invoice_queue table already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. ADD xero_contact_id TO businesspartners
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'businesspartners'
      AND COLUMN_NAME = 'xero_contact_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `businesspartners` ADD COLUMN `xero_contact_id` VARCHAR(255) NULL AFTER `vat_nr`',
    'SELECT "✓ businesspartners.xero_contact_id already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ADD xero_synced_at TO businesspartners
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'businesspartners'
      AND COLUMN_NAME = 'xero_synced_at'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `businesspartners` ADD COLUMN `xero_synced_at` DATETIME NULL AFTER `xero_contact_id`',
    'SELECT "✓ businesspartners.xero_synced_at already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for xero_contact_id
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'businesspartners'
      AND INDEX_NAME = 'idx_bp_xero_contact'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `businesspartners` ADD INDEX `idx_bp_xero_contact` (`xero_contact_id`)',
    'SELECT "✓ idx_bp_xero_contact already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 5. ADD xero_item_id TO products
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'xero_item_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `products` ADD COLUMN `xero_item_id` VARCHAR(255) NULL AFTER `vat`',
    'SELECT "✓ products.xero_item_id already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ADD xero_synced_at TO products
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'xero_synced_at'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `products` ADD COLUMN `xero_synced_at` DATETIME NULL AFTER `xero_item_id`',
    'SELECT "✓ products.xero_synced_at already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for xero_item_id
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND INDEX_NAME = 'idx_prod_xero_item'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `products` ADD INDEX `idx_prod_xero_item` (`xero_item_id`)',
    'SELECT "✓ idx_prod_xero_item already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 6. ADD xero_invoice_id TO weighingheaders
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'weighingheaders'
      AND COLUMN_NAME = 'xero_invoice_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `xero_invoice_id` VARCHAR(255) NULL',
    'SELECT "✓ weighingheaders.xero_invoice_id already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ADD invoice_modified TO weighingheaders
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'weighingheaders'
      AND COLUMN_NAME = 'invoice_modified'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `invoice_modified` TINYINT(1) NOT NULL DEFAULT 0',
    'SELECT "✓ weighingheaders.invoice_modified already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for xero_invoice_id
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'weighingheaders'
      AND INDEX_NAME = 'idx_wh_xero_invoice'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `weighingheaders` ADD INDEX `idx_wh_xero_invoice` (`xero_invoice_id`)',
    'SELECT "✓ idx_wh_xero_invoice already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 6b. ADD XERO LIFECYCLE STATUS FIELDS
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
      AND COLUMN_NAME = 'xero_status'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `xero_invoice_queue` ADD COLUMN `xero_status` VARCHAR(30) NULL AFTER `xero_invoice_number`',
    'SELECT "✓ xero_invoice_queue.xero_status already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
      AND COLUMN_NAME = 'xero_total'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `xero_invoice_queue` ADD COLUMN `xero_total` DECIMAL(12,2) NULL AFTER `xero_status`',
    'SELECT "✓ xero_invoice_queue.xero_total already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
      AND COLUMN_NAME = 'xero_amount_paid'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `xero_invoice_queue` ADD COLUMN `xero_amount_paid` DECIMAL(12,2) NULL AFTER `xero_total`',
    'SELECT "✓ xero_invoice_queue.xero_amount_paid already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
      AND COLUMN_NAME = 'xero_amount_due'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `xero_invoice_queue` ADD COLUMN `xero_amount_due` DECIMAL(12,2) NULL AFTER `xero_amount_paid`',
    'SELECT "✓ xero_invoice_queue.xero_amount_due already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
      AND COLUMN_NAME = 'xero_updated_at'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `xero_invoice_queue` ADD COLUMN `xero_updated_at` DATETIME NULL AFTER `xero_amount_due`',
    'SELECT "✓ xero_invoice_queue.xero_updated_at already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
      AND COLUMN_NAME = 'xero_last_status_sync_at'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `xero_invoice_queue` ADD COLUMN `xero_last_status_sync_at` DATETIME NULL AFTER `xero_updated_at`',
    'SELECT "✓ xero_invoice_queue.xero_last_status_sync_at already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
      AND COLUMN_NAME = 'status_sync_error'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `xero_invoice_queue` ADD COLUMN `status_sync_error` TEXT NULL AFTER `error_message`',
    'SELECT "✓ xero_invoice_queue.status_sync_error already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_invoice_queue'
      AND INDEX_NAME = 'idx_xero_invoice_xero_status'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `xero_invoice_queue` ADD INDEX `idx_xero_invoice_xero_status` (`xero_status`)',
    'SELECT "✓ idx_xero_invoice_xero_status already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'weighingheaders'
      AND COLUMN_NAME = 'xero_invoice_status'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `xero_invoice_status` VARCHAR(30) NULL AFTER `xero_invoice_id`',
    'SELECT "✓ weighingheaders.xero_invoice_status already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'weighingheaders'
      AND COLUMN_NAME = 'xero_invoice_status_updated_at'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `xero_invoice_status_updated_at` DATETIME NULL AFTER `xero_invoice_status`',
    'SELECT "✓ weighingheaders.xero_invoice_status_updated_at already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 7. CREATE jobs TABLE (Laravel queue driver)
-- =====================================================
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE `jobs` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `queue` VARCHAR(255) NOT NULL,
        `payload` LONGTEXT NOT NULL,
        `attempts` TINYINT UNSIGNED NOT NULL,
        `reserved_at` INT UNSIGNED NULL,
        `available_at` INT UNSIGNED NOT NULL,
        `created_at` INT UNSIGNED NOT NULL,
        INDEX `idx_jobs_queue` (`queue`, `reserved_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'SELECT "✓ jobs table already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 8. CREATE failed_jobs TABLE (Laravel queue driver)
-- =====================================================
SET @table_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'failed_jobs'
);

SET @sql = IF(@table_exists = 0,
    'CREATE TABLE `failed_jobs` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `uuid` VARCHAR(255) NOT NULL UNIQUE,
        `connection` TEXT NOT NULL,
        `queue` TEXT NOT NULL,
        `payload` LONGTEXT NOT NULL,
        `exception` LONGTEXT NOT NULL,
        `failed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4',
    'SELECT "✓ failed_jobs table already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 8. ADD xero PERMISSION TO usertypes TABLE
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usertypes'
      AND COLUMN_NAME = 'xero'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `usertypes` ADD COLUMN `xero` VARCHAR(255) NOT NULL DEFAULT ''false'' AFTER `delete_transaction_flag`',
    'SELECT "✓ usertypes.xero already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 9. ADD previous_xero_tenant_id TO xero_settings
--    (audit trail for tenant change detection)
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_settings'
      AND COLUMN_NAME = 'previous_xero_tenant_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `xero_settings` ADD COLUMN `previous_xero_tenant_id` VARCHAR(255) NULL AFTER `xero_tenant_id`',
    'SELECT "✓ xero_settings.previous_xero_tenant_id already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 10. CONVERT sync_customers/sync_products TO VARCHAR
--    (for deployments that already have TINYINT columns)
-- =====================================================
SET @col_type = (
    SELECT DATA_TYPE
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'xero_settings'
      AND COLUMN_NAME = 'sync_customers'
);

SET @sql = IF(@col_type = 'tinyint',
    'ALTER TABLE `xero_settings`
        MODIFY COLUMN `sync_customers` VARCHAR(20) NOT NULL DEFAULT ''bidirectional'' COMMENT ''off, xero_to_weighsoft, weighsoft_to_xero, bidirectional'',
        MODIFY COLUMN `sync_products` VARCHAR(20) NOT NULL DEFAULT ''bidirectional'' COMMENT ''off, xero_to_weighsoft, weighsoft_to_xero, bidirectional''',
    'SELECT "✓ sync_customers/sync_products already VARCHAR" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Convert old boolean values to direction strings
UPDATE `xero_settings` SET `sync_customers` = 'bidirectional' WHERE `sync_customers` IN ('1', 'true');
UPDATE `xero_settings` SET `sync_customers` = 'off' WHERE `sync_customers` IN ('0', 'false', '');
UPDATE `xero_settings` SET `sync_products` = 'bidirectional' WHERE `sync_products` IN ('1', 'true');
UPDATE `xero_settings` SET `sync_products` = 'off' WHERE `sync_products` IN ('0', 'false', '');

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT '========================================' as '';
SELECT 'XERO INTEGRATION - VERIFICATION RESULTS' as '';
SELECT '========================================' as '';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ xero_settings TABLE EXISTS'
        ELSE '✗ xero_settings TABLE MISSING'
    END as Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_settings';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ xero_sync_log TABLE EXISTS'
        ELSE '✗ xero_sync_log TABLE MISSING'
    END as Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_sync_log';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ xero_invoice_queue TABLE EXISTS'
        ELSE '✗ xero_invoice_queue TABLE MISSING'
    END as Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_invoice_queue';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ businesspartners.xero_contact_id EXISTS'
        ELSE '✗ businesspartners.xero_contact_id MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'businesspartners'
  AND COLUMN_NAME = 'xero_contact_id';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ businesspartners.xero_synced_at EXISTS'
        ELSE '✗ businesspartners.xero_synced_at MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'businesspartners'
  AND COLUMN_NAME = 'xero_synced_at';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ idx_bp_xero_contact INDEX EXISTS'
        ELSE '✗ idx_bp_xero_contact INDEX MISSING'
    END as Status
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'businesspartners'
  AND INDEX_NAME = 'idx_bp_xero_contact';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ products.xero_item_id EXISTS'
        ELSE '✗ products.xero_item_id MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME = 'xero_item_id';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ products.xero_synced_at EXISTS'
        ELSE '✗ products.xero_synced_at MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME = 'xero_synced_at';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ idx_prod_xero_item INDEX EXISTS'
        ELSE '✗ idx_prod_xero_item INDEX MISSING'
    END as Status
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'products'
  AND INDEX_NAME = 'idx_prod_xero_item';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ weighingheaders.xero_invoice_id EXISTS'
        ELSE '✗ weighingheaders.xero_invoice_id MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'weighingheaders'
  AND COLUMN_NAME = 'xero_invoice_id';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ weighingheaders.invoice_modified EXISTS'
        ELSE '✗ weighingheaders.invoice_modified MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'weighingheaders'
  AND COLUMN_NAME = 'invoice_modified';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ xero_invoice_queue.xero_status EXISTS'
        ELSE '✗ xero_invoice_queue.xero_status MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_invoice_queue'
  AND COLUMN_NAME = 'xero_status';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ xero_invoice_queue.xero_last_status_sync_at EXISTS'
        ELSE '✗ xero_invoice_queue.xero_last_status_sync_at MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_invoice_queue'
  AND COLUMN_NAME = 'xero_last_status_sync_at';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ weighingheaders.xero_invoice_status EXISTS'
        ELSE '✗ weighingheaders.xero_invoice_status MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'weighingheaders'
  AND COLUMN_NAME = 'xero_invoice_status';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ idx_xero_invoice_xero_status INDEX EXISTS'
        ELSE '✗ idx_xero_invoice_xero_status INDEX MISSING'
    END as Status
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_invoice_queue'
  AND INDEX_NAME = 'idx_xero_invoice_xero_status';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ idx_wh_xero_invoice INDEX EXISTS'
        ELSE '✗ idx_wh_xero_invoice INDEX MISSING'
    END as Status
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'weighingheaders'
  AND INDEX_NAME = 'idx_wh_xero_invoice';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ jobs TABLE EXISTS'
        ELSE '✗ jobs TABLE MISSING'
    END as Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'jobs';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ failed_jobs TABLE EXISTS'
        ELSE '✗ failed_jobs TABLE MISSING'
    END as Status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'failed_jobs';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ fk_xero_settings_company FK EXISTS'
        ELSE '✗ fk_xero_settings_company FK MISSING'
    END as Status
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_settings'
  AND CONSTRAINT_NAME = 'fk_xero_settings_company';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ fk_xero_sync_log_company FK EXISTS'
        ELSE '✗ fk_xero_sync_log_company FK MISSING'
    END as Status
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_sync_log'
  AND CONSTRAINT_NAME = 'fk_xero_sync_log_company';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ fk_xero_invoice_company FK EXISTS'
        ELSE '✗ fk_xero_invoice_company FK MISSING'
    END as Status
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_invoice_queue'
  AND CONSTRAINT_NAME = 'fk_xero_invoice_company';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ usertypes.xero COLUMN EXISTS'
        ELSE '✗ usertypes.xero COLUMN MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'usertypes'
  AND COLUMN_NAME = 'xero';

SELECT
    CASE
        WHEN COUNT(*) > 0 THEN '✓ xero_settings.previous_xero_tenant_id EXISTS'
        ELSE '✗ xero_settings.previous_xero_tenant_id MISSING'
    END as Status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'xero_settings'
  AND COLUMN_NAME = 'previous_xero_tenant_id';

SELECT '========================================' as '';
SELECT 'All checks should show ✓' as '';
SELECT 'If any show ✗, contact support' as '';
SELECT '========================================' as '';
