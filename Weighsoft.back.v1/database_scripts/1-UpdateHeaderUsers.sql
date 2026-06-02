DELIMITER $$

CREATE PROCEDURE `ws_users_update`()
BEGIN
	DECLARE `_rollback` BOOL DEFAULT 0;
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;
	
	START TRANSACTION;
	
	ALTER TABLE weighingheaders ADD firstWeightUserId int(10) UNSIGNED NOT NULL DEFAULT 21;
	ALTER TABLE weighingheaders ADD secondWeightUserId int(10) UNSIGNED DEFAULT NULL;
	ALTER TABLE weighingheaders ADD verifyUserId int(10) UNSIGNED DEFAULT NULL;
	ALTER TABLE weighingheaders ADD deletedUserId int(10) UNSIGNED DEFAULT NULL;

	ALTER TABLE weighingheaders ADD CONSTRAINT FK_FirstWeightUserWeighingheader FOREIGN KEY (firstWeightUserId) REFERENCES users (id);
	ALTER TABLE weighingheaders ADD CONSTRAINT FK_SecondWeightUserWeighingheader FOREIGN KEY (secondWeightUserId) REFERENCES users (id);
	ALTER TABLE weighingheaders ADD CONSTRAINT FK_VerifyUserWeighingheader FOREIGN KEY (verifyUserId) REFERENCES users (id);
	ALTER TABLE weighingheaders ADD CONSTRAINT FK_DeleteUserWeighingheader FOREIGN KEY (deletedUserId) REFERENCES users (id);

	IF `_rollback` THEN
		ROLLBACK;
		SELECT "weighingheaders table changes were rolled back due to a problem" AS "message";
	ELSE
		COMMIT;
		SELECT "weighingheaders table changes successfully commited" AS "message";
	END IF;
END$$

DELIMITER ;

-- CALL ws_users_update(); 
-- 
-- SELECT * FROM weighingheaders w ;
-- 
-- DROP PROCEDURE ws_users_update;

