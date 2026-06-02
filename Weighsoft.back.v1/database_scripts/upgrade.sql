-- ============================================================
-- UPGRADE SCRIPT: old.sql → current.sql
-- Upgrades the 28 tables in DATABASE-TABLES.md
-- WITHOUT data loss.
--
-- BACK UP YOUR DATABASE BEFORE RUNNING THIS!
--
--  [1]  axelsetups           - NO CHANGES
--  [2]  axletypes            - NO CHANGES
--  [3]  businesspartners     - NO CHANGES
--  [4]  cameras              - NO CHANGES
--  [5]  companies            - NO CHANGES
--  [6]  contracts            - NO CHANGES
--  [7]  contract_transactions - FK change (UUID migration)
--  [8]  errorlog             - NO CHANGES
--  [9]  exceptions           - NO CHANGES
--  [10] grades               - NO CHANGES
--  [11] hauliers             - NO CHANGES
--  [12] migrations           - NO CHANGES
--  [13] pallets              - datetime defaults
--  [14] products             - ADD grades_enabled, grades
--  [15] reporting            - NO CHANGES
--  [16] rfid_vehicles        - NO CHANGES
--  [17] settings             - ADD site_id, workstation_id
--  [18] sites                - NO CHANGES
--  [19] tares                - datetime defaults
--  [20] transactions         - NO CHANGES
--  [21] users                - NO CHANGES
--  [22] usertypes            - ADD delete_transaction_flag
--  [23] weighbridges         - ADD 6 display columns
--  [24] weighingcameras      - NO ADDITIONS (print_camera kept)
--  [25] weighingcameras_old  - NO CHANGES
--  [26] weighingheaders      - ADD 4 columns + UUID migration
--  [27] weighingtransactions - UUID migration
--  [28] workstations         - NO CHANGES
-- ============================================================


-- ============================================================
-- SECTION 1: UUID HELPER FUNCTIONS
-- ============================================================

DELIMITER $$

CREATE FUNCTION IF NOT EXISTS BIN_TO_UUID(b BINARY(16), f BOOLEAN)
RETURNS CHAR(36)
DETERMINISTIC
BEGIN
   DECLARE hexStr CHAR(32);
   SET hexStr = HEX(b);
   RETURN LOWER(CONCAT(
        IF(f,SUBSTR(hexStr, 9, 8),SUBSTR(hexStr, 1, 8)), '-',
        IF(f,SUBSTR(hexStr, 5, 4),SUBSTR(hexStr, 9, 4)), '-',
        IF(f,SUBSTR(hexStr, 1, 4),SUBSTR(hexStr, 13, 4)), '-',
        SUBSTR(hexStr, 17, 4), '-',
        SUBSTR(hexStr, 21)
    ));
END$$

CREATE FUNCTION IF NOT EXISTS UUID_TO_BIN(uuid CHAR(36), f BOOLEAN)
RETURNS BINARY(16)
DETERMINISTIC
BEGIN
  RETURN UNHEX(CONCAT(
  IF(f,SUBSTRING(uuid, 15, 4),SUBSTRING(uuid, 1, 8)),
  SUBSTRING(uuid, 10, 4),
  IF(f,SUBSTRING(uuid, 1, 8),SUBSTRING(uuid, 15, 4)),
  SUBSTRING(uuid, 20, 4),
  SUBSTRING(uuid, 25))
  );
END$$

DELIMITER ;


-- ============================================================
-- SECTION 2: COLUMN ADDITIONS
-- ============================================================

-- [14] products
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `grades_enabled` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL;
ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `grades` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL;

-- [17] settings
-- NOTE: After running, UPDATE site_id and workstation_id with correct values
ALTER TABLE `settings` ADD COLUMN IF NOT EXISTS `site_id` int(10) UNSIGNED NOT NULL DEFAULT 0;
ALTER TABLE `settings` ADD COLUMN IF NOT EXISTS `workstation_id` int(10) UNSIGNED NOT NULL DEFAULT 0;

-- [22] usertypes
ALTER TABLE `usertypes` ADD COLUMN IF NOT EXISTS `delete_transaction_flag` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false';

-- [23] weighbridges
ALTER TABLE `weighbridges` ADD COLUMN IF NOT EXISTS `scale` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '';
ALTER TABLE `weighbridges` ADD COLUMN IF NOT EXISTS `remote_display` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '';
ALTER TABLE `weighbridges` ADD COLUMN IF NOT EXISTS `display_ip_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '';
ALTER TABLE `weighbridges` ADD COLUMN IF NOT EXISTS `display_port_num` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '';
ALTER TABLE `weighbridges` ADD COLUMN IF NOT EXISTS `display_data_bits` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '';
ALTER TABLE `weighbridges` ADD COLUMN IF NOT EXISTS `display_baud_rate` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '';

-- [26] weighingheaders (columns only; UUID migration below)
ALTER TABLE `weighingheaders` ADD COLUMN IF NOT EXISTS `moistureCoefficient` decimal(20,8) DEFAULT NULL;
ALTER TABLE `weighingheaders` ADD COLUMN IF NOT EXISTS `moistureWeight` decimal(20,8) DEFAULT NULL;
ALTER TABLE `weighingheaders` ADD COLUMN IF NOT EXISTS `handlingWeight` decimal(20,8) DEFAULT NULL;
ALTER TABLE `weighingheaders` ADD COLUMN IF NOT EXISTS `grades` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL;


-- ============================================================
-- SECTION 3: UUID MIGRATION
--
-- Converts weighingheaders + weighingtransactions PKs
-- from int(10) → binary(16) using existing uuid columns.
-- Also fixes contract_transactions FK.
--
-- Old state:
--   weighingheaders:       id=int(10), uuid=binary(16)
--   weighingtransactions:  id=int(10), uuid=binary(16),
--                          weighing_header_id=int(10),
--                          weighing_header_uuid=binary(16)
--   contract_transactions: weighing_header_id=binary(16)
--                          FK → weighingheaders(uuid)
--
-- Target state:
--   weighingheaders:       id=binary(16), no uuid col
--   weighingtransactions:  id=binary(16),
--                          weighing_header_id=binary(16),
--                          no uuid/weighing_header_uuid cols
--   contract_transactions: FK → weighingheaders(id)
-- ============================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS `upgrade_uuid_migration`$$
CREATE PROCEDURE `upgrade_uuid_migration`()
BEGIN
    DECLARE `_rollback` BOOL DEFAULT 0;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;

    START TRANSACTION;

    -- Drop FK constraints pointing to weighingheaders
    ALTER TABLE `weighingtransactions` DROP FOREIGN KEY `weighingtransactions_weighing_header_id_foreign`;
    ALTER TABLE `contract_transactions` DROP FOREIGN KEY `FK_weighing_header_id`;

    -- Drop indexes on FK/UUID columns
    ALTER TABLE `weighingtransactions` DROP INDEX `weighingtransactions_weighing_header_id_foreign`;
    ALTER TABLE `contract_transactions` DROP INDEX `FK_weighing_header_id`;
    ALTER TABLE `weighingheaders` DROP INDEX `uuid`;
    ALTER TABLE `weighingtransactions` DROP INDEX `uuid`;

    -- Convert weighingheaders.id: int(10) → binary(16)
    ALTER TABLE `weighingheaders` MODIFY `id` int(10) UNSIGNED NOT NULL;
    ALTER TABLE `weighingheaders` DROP PRIMARY KEY;
    ALTER TABLE `weighingheaders` MODIFY `id` binary(16) NOT NULL;
    UPDATE `weighingheaders` SET `id` = `uuid`;
    ALTER TABLE `weighingheaders` ADD PRIMARY KEY (`id`);

    -- Convert weighingtransactions.weighing_header_id: int → binary(16)
    ALTER TABLE `weighingtransactions` MODIFY `weighing_header_id` binary(16) DEFAULT NULL;
    UPDATE `weighingtransactions` SET `weighing_header_id` = `weighing_header_uuid`;

    -- Re-add FK: weighingtransactions → weighingheaders(id)
    ALTER TABLE `weighingtransactions` ADD CONSTRAINT `weighingtransactions_weighing_header_id_foreign`
        FOREIGN KEY (`weighing_header_id`) REFERENCES `weighingheaders` (`id`);
    CREATE INDEX `weighingtransactions_weighing_header_id_foreign`
        ON `weighingtransactions`(`weighing_header_id`);

    -- Re-add FK: contract_transactions → weighingheaders(id)
    ALTER TABLE `contract_transactions` ADD CONSTRAINT `FK_weighing_header_id`
        FOREIGN KEY (`weighing_header_id`) REFERENCES `weighingheaders` (`id`);
    CREATE INDEX `FK_weighing_header_id`
        ON `contract_transactions`(`weighing_header_id`);

    -- Convert weighingtransactions.id: int(10) → binary(16)
    ALTER TABLE `weighingtransactions` MODIFY `id` int(10) UNSIGNED NOT NULL;
    ALTER TABLE `weighingtransactions` DROP PRIMARY KEY;
    ALTER TABLE `weighingtransactions` MODIFY `id` binary(16) NOT NULL;
    UPDATE `weighingtransactions` SET `id` = UUID_TO_BIN(UUID(), TRUE);
    ALTER TABLE `weighingtransactions` ADD PRIMARY KEY (`id`);

    -- Add composite index on weighingheaders
    CREATE INDEX `INDX_weighingheaders_select`
        ON `weighingheaders`(`deleted_at`, `company_id`, `site_id`, `workstation_id`, `status`);

    -- [13] pallets + [19] tares: fix datetime defaults
    ALTER TABLE `weighingheaders` MODIFY `deleted_at` datetime DEFAULT NULL;
    ALTER TABLE `tares` MODIFY `created_at` datetime DEFAULT NULL;
    ALTER TABLE `tares` MODIFY `updated_at` datetime DEFAULT NULL;
    ALTER TABLE `pallets` MODIFY `created_at` datetime DEFAULT NULL;
    ALTER TABLE `pallets` MODIFY `updated_at` datetime DEFAULT NULL;

    -- Drop old uuid helper columns
    ALTER TABLE `weighingheaders` DROP COLUMN `uuid`;
    ALTER TABLE `weighingtransactions` DROP COLUMN `uuid`;
    ALTER TABLE `weighingtransactions` DROP COLUMN `weighing_header_uuid`;

    IF `_rollback` THEN
        ROLLBACK;
        SELECT 'UUID MIGRATION ROLLED BACK - check for errors' AS result;
    ELSE
        COMMIT;
        SELECT 'UUID MIGRATION completed successfully' AS result;
    END IF;
END$$

DELIMITER ;

CALL `upgrade_uuid_migration`();
DROP PROCEDURE IF EXISTS `upgrade_uuid_migration`;


-- ============================================================
-- POST-UPGRADE CHECKLIST
--
-- [ ] Verify UUIDs: SELECT BIN_TO_UUID(id, TRUE) FROM weighingheaders LIMIT 5;
-- [ ] Verify FKs:   SELECT COUNT(*) FROM weighingtransactions wt
--                    LEFT JOIN weighingheaders wh ON wt.weighing_header_id = wh.id
--                    WHERE wh.id IS NULL AND wt.weighing_header_id IS NOT NULL;
-- [ ] Update settings.site_id and settings.workstation_id with correct values
-- [ ] Test application login and basic weighing flow
--
-- Columns kept from old (not in current, preserved for safety):
--   settings.measure_type, settings.deduct_flow
--   weighingcameras.print_camera
-- ============================================================
