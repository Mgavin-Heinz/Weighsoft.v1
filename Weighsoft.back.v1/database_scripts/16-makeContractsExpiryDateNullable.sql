-- Make contracts.expiry_date optional (nullable).
-- Safe to run once; MySQL will error if column is already nullable (adjust or ignore).

SET @dbname = DATABASE();

SET @sql = (
  SELECT IF(
    (SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'contracts' AND COLUMN_NAME = 'expiry_date') = 'YES',
    'SELECT "contracts.expiry_date already nullable" AS Status',
    'ALTER TABLE `contracts` MODIFY COLUMN `expiry_date` DATE NULL'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
