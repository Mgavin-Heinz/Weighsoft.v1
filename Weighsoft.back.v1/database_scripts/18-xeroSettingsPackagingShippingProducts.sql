-- Xero invoice lines for packaging/shipping: link to WeighSoft products (synced to Xero as items).
-- Per-ticket amounts still come from weighingheaders snapshots; these IDs are only item mapping.

SET @dbname = DATABASE();

-- xero_settings.packaging_product_id
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'xero_settings' AND COLUMN_NAME = 'packaging_product_id') = 0,
    'ALTER TABLE `xero_settings` ADD COLUMN `packaging_product_id` INT UNSIGNED NULL COMMENT ''WeighSoft product for packaging line (must have xero_item_id)'' AFTER `last_product_sync_at`',
    'SELECT "xero_settings.packaging_product_id already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- xero_settings.shipping_product_id
SET @sql = (
  SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'xero_settings' AND COLUMN_NAME = 'shipping_product_id') = 0,
    'ALTER TABLE `xero_settings` ADD COLUMN `shipping_product_id` INT UNSIGNED NULL COMMENT ''WeighSoft product for shipping line (must have xero_item_id)'' AFTER `packaging_product_id`',
    'SELECT "xero_settings.shipping_product_id already exists" AS Status'
  )
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Optional FKs (only if products table exists and columns were just added)
SET @pkg_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'xero_settings' AND COLUMN_NAME = 'packaging_product_id'
);
SET @shp_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'xero_settings' AND COLUMN_NAME = 'shipping_product_id'
);

SET @fk_pkg = (
  SELECT IF(
    @pkg_exists = 0,
    'SELECT "skip pkg fk" AS Status',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'xero_settings' AND CONSTRAINT_NAME = 'fk_xero_settings_packaging_product') = 0,
      'ALTER TABLE `xero_settings` ADD CONSTRAINT `fk_xero_settings_packaging_product` FOREIGN KEY (`packaging_product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL',
      'SELECT "fk_xero_settings_packaging_product already exists" AS Status'
    )
  )
);
PREPARE stmt FROM @fk_pkg; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_shp = (
  SELECT IF(
    @shp_exists = 0,
    'SELECT "skip shp fk" AS Status',
    IF(
      (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'xero_settings' AND CONSTRAINT_NAME = 'fk_xero_settings_shipping_product') = 0,
      'ALTER TABLE `xero_settings` ADD CONSTRAINT `fk_xero_settings_shipping_product` FOREIGN KEY (`shipping_product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL',
      'SELECT "fk_xero_settings_shipping_product already exists" AS Status'
    )
  )
);
PREPARE stmt FROM @fk_shp; EXECUTE stmt; DEALLOCATE PREPARE stmt;
