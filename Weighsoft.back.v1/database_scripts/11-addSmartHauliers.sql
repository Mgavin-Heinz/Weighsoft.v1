-- Smart Hauliers Feature - Database Schema Changes
-- For systems that don't follow Laravel migrations
-- Compatible with MySQL 5.7+ and MariaDB 10.2+

-- IMPORTANT: This script is safe to run multiple times
-- It checks for existing columns/constraints before adding them

USE weighsoft;

-- =====================================================
-- 1. Add smart_hauliers flag to companies table
-- =====================================================

ALTER TABLE `companies` 
ADD COLUMN IF NOT EXISTS `smart_hauliers` TINYINT(1) NOT NULL DEFAULT 0 
AFTER `display_custom_logo_img`;

-- =====================================================
-- 2. Add business_partner_id to hauliers table
-- =====================================================

-- Add column (safe - won't error if exists)
ALTER TABLE `hauliers` 
ADD COLUMN IF NOT EXISTS `business_partner_id` INT(10) UNSIGNED NULL DEFAULT NULL 
AFTER `site_id`;

-- Add index (safe - won't error if exists)
ALTER TABLE `hauliers` 
ADD INDEX IF NOT EXISTS `idx_hauliers_business_partner` (`business_partner_id`);

-- Add foreign key constraint (check if exists first)
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'hauliers' 
      AND CONSTRAINT_NAME = 'fk_hauliers_business_partner'
);

SET @add_fk = IF(@constraint_exists = 0,
    'ALTER TABLE `hauliers` 
     ADD CONSTRAINT `fk_hauliers_business_partner` 
     FOREIGN KEY (`business_partner_id`) 
     REFERENCES `businesspartners`(`id`) 
     ON DELETE SET NULL',
    'SELECT "Foreign key fk_hauliers_business_partner already exists" as Status'
);

PREPARE stmt FROM @add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 3. Add haulier_id and site_id to rfid_vehicles table
-- =====================================================

-- Add haulier_id column
ALTER TABLE `rfid_vehicles` 
ADD COLUMN IF NOT EXISTS `haulier_id` INT(10) UNSIGNED NULL DEFAULT NULL 
AFTER `rfid`;

-- Add site_id column
ALTER TABLE `rfid_vehicles` 
ADD COLUMN IF NOT EXISTS `site_id` INT(10) UNSIGNED NULL DEFAULT NULL 
AFTER `haulier_id`;

-- Add indexes
ALTER TABLE `rfid_vehicles` 
ADD INDEX IF NOT EXISTS `idx_rfid_vehicles_haulier` (`haulier_id`);

ALTER TABLE `rfid_vehicles` 
ADD INDEX IF NOT EXISTS `idx_rfid_vehicles_site` (`site_id`);

-- Add foreign key for haulier_id (check if exists first)
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'rfid_vehicles' 
      AND CONSTRAINT_NAME = 'fk_rfid_vehicles_haulier'
);

SET @add_fk = IF(@constraint_exists = 0,
    'ALTER TABLE `rfid_vehicles` 
     ADD CONSTRAINT `fk_rfid_vehicles_haulier` 
     FOREIGN KEY (`haulier_id`) 
     REFERENCES `hauliers`(`id`) 
     ON DELETE SET NULL',
    'SELECT "Foreign key fk_rfid_vehicles_haulier already exists" as Status'
);

PREPARE stmt FROM @add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key for site_id (check if exists first)
SET @constraint_exists = (
    SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'rfid_vehicles' 
      AND CONSTRAINT_NAME = 'fk_rfid_vehicles_site'
);

SET @add_fk = IF(@constraint_exists = 0,
    'ALTER TABLE `rfid_vehicles` 
     ADD CONSTRAINT `fk_rfid_vehicles_site` 
     FOREIGN KEY (`site_id`) 
     REFERENCES `sites`(`id`) 
     ON DELETE SET NULL',
    'SELECT "Foreign key fk_rfid_vehicles_site already exists" as Status'
);

PREPARE stmt FROM @add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Verification Queries
-- =====================================================

-- Check if all changes were applied successfully
SELECT 'Checking smart_hauliers column...' as Step;
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ smart_hauliers column exists'
        ELSE '✗ smart_hauliers column missing'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'smart_hauliers';

SELECT 'Checking business_partner_id column...' as Step;
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ business_partner_id column exists'
        ELSE '✗ business_partner_id column missing'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'hauliers' 
  AND COLUMN_NAME = 'business_partner_id';

SELECT 'Checking business_partner foreign key...' as Step;
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ business_partner foreign key exists'
        ELSE '✗ business_partner foreign key missing'
    END as Status
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'hauliers' 
  AND CONSTRAINT_NAME = 'fk_hauliers_business_partner';

SELECT 'Checking haulier_id column in rfid_vehicles...' as Step;
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ haulier_id column exists'
        ELSE '✗ haulier_id column missing'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'rfid_vehicles' 
  AND COLUMN_NAME = 'haulier_id';

SELECT 'Checking site_id column in rfid_vehicles...' as Step;
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ site_id column exists'
        ELSE '✗ site_id column missing'
    END as Status
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'rfid_vehicles' 
  AND COLUMN_NAME = 'site_id';

SELECT 'Checking rfid_vehicles foreign keys...' as Step;
SELECT 
    CONSTRAINT_NAME,
    CONCAT('✓ ', CONSTRAINT_NAME, ' exists') as Status
FROM information_schema.TABLE_CONSTRAINTS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'rfid_vehicles' 
  AND CONSTRAINT_TYPE = 'FOREIGN KEY'
  AND (CONSTRAINT_NAME = 'fk_rfid_vehicles_haulier' OR CONSTRAINT_NAME = 'fk_rfid_vehicles_site');

-- =====================================================
-- Complete!
-- Smart Hauliers feature schema changes applied successfully
-- All checks above should show ✓ symbols
-- =====================================================

