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

DROP PROCEDURE IF EXISTS `change_id_to_uuid`;
CREATE PROCEDURE `change_id_to_uuid`()
BEGIN
	DECLARE `_rollback` BOOL DEFAULT 0;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;

	START TRANSACTION;

    ALTER TABLE weighingheaders ADD uuid BINARY(16);
    UPDATE weighingheaders SET uuid=uuid_to_bin(uuid(), true);

	ALTER TABLE weighingtransactions DROP FOREIGN KEY `weighingtransactions_weighing_header_id_foreign`;
	ALTER TABLE weighingtransactions ADD weighing_header_uuid BINARY(16);
	UPDATE weighingtransactions wt
	SET wt.weighing_header_uuid = (SELECT uuid FROM weighingheaders wh WHERE wt.weighing_header_id = wh.id);

    ALTER TABLE contract_transactions ADD weighing_header_uuid BINARY(16);
    UPDATE contract_transactions ct SET ct.weighing_header_uuid = (SELECT uuid FROM weighingheaders wh WHERE ct.weighing_header_id = wh.id);

	ALTER TABLE weighingheaders MODIFY id BINARY(16);
	UPDATE weighingheaders SET id=uuid;

	ALTER TABLE weighingtransactions DROP INDEX weighingtransactions_weighing_header_id_foreign;
	ALTER TABLE weighingtransactions MODIFY weighing_header_id binary(16);
	UPDATE weighingtransactions SET weighing_header_id = weighing_header_uuid ;
	ALTER TABLE weighingtransactions ADD CONSTRAINT weighingtransactions_weighing_header_id_foreign FOREIGN KEY (weighing_header_id) REFERENCES weighingheaders(id);
	CREATE INDEX weighingtransactions_weighing_header_id_foreign ON weighingtransactions(weighing_header_id);

    ALTER TABLE contract_transactions MODIFY weighing_header_id BINARY(16);
	UPDATE contract_transactions SET weighing_header_id = weighing_header_uuid;
    ALTER TABLE contract_transactions ADD CONSTRAINT FK_weighing_header_id FOREIGN KEY (weighing_header_id) REFERENCES weighingheaders(id);
	CREATE INDEX IDX_contract_transaction_weighing_header_id ON contract_transactions(weighing_header_id);

	ALTER TABLE weighingtransactions MODIFY id binary(16);
	UPDATE weighingtransactions SET id = uuid_to_bin(uuid(), true);

	ALTER TABLE weighingheaders ADD workstation_id int(10) UNSIGNED NOT NULL;
	UPDATE weighingheaders w SET workstation_id = (SELECT ws.id FROM workstations ws, weighbridges wb WHERE ws.id = wb.workstation_id AND w.weighbridge_id = wb.id);
	ALTER TABLE weighingheaders ADD CONSTRAINT FK_weighingheaders_workstation_id FOREIGN KEY (workstation_id) REFERENCES workstations(id);
	alter table weighingheaders modify deleted_at datetime default null;
	CREATE INDEX INDX_weighingheaders_select ON weighingheaders(deleted_at, company_id, site_id, workstation_id, status);

	alter table tares modify created_at datetime default null;
    alter table tares modify updated_at datetime default null;

	alter table pallets modify created_at datetime default null;
	alter table pallets modify updated_at datetime default null;

	ALTER TABLE weighingheaders DROP COLUMN uuid;
	ALTER TABLE weighingtransactions DROP COLUMN weighing_header_uuid;
	ALTER TABLE contract_transactions DROP COLUMN weighing_header_uuid;

	IF `_rollback` THEN
		ROLLBACK;
		SELECT 'Changes were rolled back due to an error' AS message;
	ELSE
		COMMIT;
	    SELECT 'Changes successfully committed' AS message;
	END IF;
END$$

DELIMITER ;