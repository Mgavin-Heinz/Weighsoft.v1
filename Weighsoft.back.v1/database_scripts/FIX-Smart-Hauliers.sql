-- =====================================================
-- SMART HAULIERS - QUICK FIX SCRIPT (Script 13)
-- Run this on your existing database to apply all changes
-- Safe to run multiple times - checks before adding
-- Alternative to running migration 2025_12_18_000004
-- Alternative to running 13-addSmartHauliers.sql
-- =====================================================

USE weighsoft;

-- Start transaction for safety
START TRANSACTION;

-- =====================================================
-- 1. ADD smart_hauliers TO companies
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'companies'
      AND COLUMN_NAME = 'smart_hauliers'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `companies` ADD COLUMN `smart_hauliers` TINYINT(1) NOT NULL DEFAULT 0 AFTER `display_custom_logo_img`',
    'SELECT "✓ companies.smart_hauliers already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 2. ADD business_partner_id TO hauliers
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'hauliers'
      AND COLUMN_NAME = 'business_partner_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `hauliers` ADD COLUMN `business_partner_id` INT(10) UNSIGNED NULL DEFAULT NULL AFTER `site_id`',
    'SELECT "✓ hauliers.business_partner_id already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for business_partner_id
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'hauliers'
      AND INDEX_NAME = 'idx_hauliers_business_partner'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `hauliers` ADD INDEX `idx_hauliers_business_partner` (`business_partner_id`)',
    'SELECT "✓ idx_hauliers_business_partner already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for business_partner_id
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'hauliers'
      AND CONSTRAINT_NAME = 'fk_hauliers_business_partner'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `hauliers` ADD CONSTRAINT `fk_hauliers_business_partner` FOREIGN KEY (`business_partner_id`) REFERENCES `businesspartners`(`id`) ON DELETE SET NULL',
    'SELECT "✓ fk_hauliers_business_partner already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. ADD haulier_id TO rfid_vehicles
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'rfid_vehicles'
      AND COLUMN_NAME = 'haulier_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `rfid_vehicles` ADD COLUMN `haulier_id` INT(10) UNSIGNED NULL DEFAULT NULL AFTER `rfid`',
    'SELECT "✓ rfid_vehicles.haulier_id already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for haulier_id
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'rfid_vehicles'
      AND INDEX_NAME = 'idx_rfid_vehicles_haulier'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `rfid_vehicles` ADD INDEX `idx_rfid_vehicles_haulier` (`haulier_id`)',
    'SELECT "✓ idx_rfid_vehicles_haulier already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for haulier_id
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'rfid_vehicles'
      AND CONSTRAINT_NAME = 'rfid_vehicles_haulier_id_foreign'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `rfid_vehicles` ADD CONSTRAINT `rfid_vehicles_haulier_id_foreign` FOREIGN KEY (`haulier_id`) REFERENCES `hauliers`(`id`) ON DELETE SET NULL',
    'SELECT "✓ rfid_vehicles_haulier_id_foreign already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. ADD site_id TO rfid_vehicles
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'rfid_vehicles'
      AND COLUMN_NAME = 'site_id'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE `rfid_vehicles` ADD COLUMN `site_id` INT(10) UNSIGNED NULL DEFAULT NULL AFTER `haulier_id`',
    'SELECT "✓ rfid_vehicles.site_id already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for site_id
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'rfid_vehicles'
      AND INDEX_NAME = 'idx_rfid_vehicles_site'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE `rfid_vehicles` ADD INDEX `idx_rfid_vehicles_site` (`site_id`)',
    'SELECT "✓ idx_rfid_vehicles_site already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for site_id
SET @fk_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'rfid_vehicles'
      AND CONSTRAINT_NAME = 'rfid_vehicles_site_id_foreign'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `rfid_vehicles` ADD CONSTRAINT `rfid_vehicles_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE SET NULL',
    'SELECT "✓ rfid_vehicles_site_id_foreign already exists" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 5. REMOVE vehicles COLUMN FROM usertypes (if exists)
-- =====================================================
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'usertypes'
      AND COLUMN_NAME = 'vehicles'
);

SET @sql = IF(@column_exists > 0,
    'ALTER TABLE `usertypes` DROP COLUMN `vehicles`',
    'SELECT "✓ usertypes.vehicles already removed" as Status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Commit all changes
COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT '========================================' as '';
SELECT 'VERIFICATION RESULTS' as '';
SELECT '========================================' as '';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ companies.smart_hauliers EXISTS'
        ELSE '✗ companies.smart_hauliers MISSING'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'smart_hauliers';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ hauliers.business_partner_id EXISTS'
        ELSE '✗ hauliers.business_partner_id MISSING'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'hauliers' 
  AND COLUMN_NAME = 'business_partner_id';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ hauliers FK to businesspartners EXISTS'
        ELSE '✗ hauliers FK to businesspartners MISSING'
    END as Status
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'hauliers' 
  AND CONSTRAINT_NAME = 'fk_hauliers_business_partner';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ rfid_vehicles.haulier_id EXISTS'
        ELSE '✗ rfid_vehicles.haulier_id MISSING'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'rfid_vehicles' 
  AND COLUMN_NAME = 'haulier_id';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ rfid_vehicles.site_id EXISTS'
        ELSE '✗ rfid_vehicles.site_id MISSING'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'rfid_vehicles' 
  AND COLUMN_NAME = 'site_id';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ rfid_vehicles FK to hauliers EXISTS'
        ELSE '✗ rfid_vehicles FK to hauliers MISSING'
    END as Status
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'rfid_vehicles' 
  AND CONSTRAINT_NAME = 'rfid_vehicles_haulier_id_foreign';

SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ rfid_vehicles FK to sites EXISTS'
        ELSE '✗ rfid_vehicles FK to sites MISSING'
    END as Status
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'rfid_vehicles' 
  AND CONSTRAINT_NAME = 'rfid_vehicles_site_id_foreign';

SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✓ usertypes.vehicles REMOVED (correct)'
        ELSE '✗ usertypes.vehicles STILL EXISTS'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'usertypes' 
  AND COLUMN_NAME = 'vehicles';

SELECT '========================================' as '';
SELECT 'All checks should show ✓' as '';
SELECT 'If any show ✗, contact support' as '';
SELECT '========================================' as '';

