-- Optional manual migration: stockpile_nr and destination on contracts and weighingheaders
-- Safe to run if columns already exist (check INFORMATION_SCHEMA first in production).

SET @dbname = DATABASE();

-- contracts.stockpile_nr
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'contracts' AND COLUMN_NAME = 'stockpile_nr') = 0,
    'ALTER TABLE `contracts` ADD COLUMN `stockpile_nr` VARCHAR(255) NULL',
    'SELECT "contracts.stockpile_nr already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- contracts.destination
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'contracts' AND COLUMN_NAME = 'destination') = 0,
    'ALTER TABLE `contracts` ADD COLUMN `destination` VARCHAR(255) NULL',
    'SELECT "contracts.destination already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- weighingheaders.stockpile_nr
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'weighingheaders' AND COLUMN_NAME = 'stockpile_nr') = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `stockpile_nr` VARCHAR(255) NULL',
    'SELECT "weighingheaders.stockpile_nr already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- weighingheaders.destination
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'weighingheaders' AND COLUMN_NAME = 'destination') = 0,
    'ALTER TABLE `weighingheaders` ADD COLUMN `destination` VARCHAR(255) NULL',
    'SELECT "weighingheaders.destination already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
