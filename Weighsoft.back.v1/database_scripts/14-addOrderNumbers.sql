-- Optional manual migration: order_numbers on contracts and weighingheaders
-- Safe to run if columns already exist (check INFORMATION_SCHEMA first in production).

SET @dbname = DATABASE();

-- contracts.order_numbers
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'contracts' AND COLUMN_NAME = 'order_numbers') = 0,
    'ALTER TABLE `contracts` ADD COLUMN `order_numbers` VARCHAR(255) NULL',
    'SELECT "contracts.order_numbers already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- weighingheaders.order_numbers
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'weighingheaders' AND COLUMN_NAME = 'order_numbers') = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `order_numbers` VARCHAR(255) NULL',
    'SELECT "weighingheaders.order_numbers already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
