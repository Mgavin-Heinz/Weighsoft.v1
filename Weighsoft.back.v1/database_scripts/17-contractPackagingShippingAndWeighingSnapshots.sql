-- Contract packaging/shipping (per ton) and weighing header price snapshots.
-- Safe to run if columns already exist.

SET @dbname = DATABASE();

-- contracts.packaging_enabled
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'contracts' AND COLUMN_NAME = 'packaging_enabled') = 0,
    'ALTER TABLE `contracts` ADD COLUMN `packaging_enabled` VARCHAR(25) NULL',
    'SELECT "contracts.packaging_enabled already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- contracts.packaging_price_per_ton
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'contracts' AND COLUMN_NAME = 'packaging_price_per_ton') = 0,
    'ALTER TABLE `contracts` ADD COLUMN `packaging_price_per_ton` DECIMAL(15,2) NULL',
    'SELECT "contracts.packaging_price_per_ton already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- contracts.shipping_enabled
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'contracts' AND COLUMN_NAME = 'shipping_enabled') = 0,
    'ALTER TABLE `contracts` ADD COLUMN `shipping_enabled` VARCHAR(25) NULL',
    'SELECT "contracts.shipping_enabled already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- contracts.shipping_price_per_ton
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'contracts' AND COLUMN_NAME = 'shipping_price_per_ton') = 0,
    'ALTER TABLE `contracts` ADD COLUMN `shipping_price_per_ton` DECIMAL(15,2) NULL',
    'SELECT "contracts.shipping_price_per_ton already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- weighingheaders.contract_packaging_price_per_ton
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'weighingheaders' AND COLUMN_NAME = 'contract_packaging_price_per_ton') = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `contract_packaging_price_per_ton` DECIMAL(15,2) NULL',
    'SELECT "weighingheaders.contract_packaging_price_per_ton already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- weighingheaders.contract_shipping_price_per_ton
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'weighingheaders' AND COLUMN_NAME = 'contract_shipping_price_per_ton') = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `contract_shipping_price_per_ton` DECIMAL(15,2) NULL',
    'SELECT "weighingheaders.contract_shipping_price_per_ton already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
