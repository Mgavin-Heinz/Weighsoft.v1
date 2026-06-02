DELIMITER $$

CREATE PROCEDURE `merge_danoher_databases`()
BEGIN 
	DECLARE `_rollback` BOOL DEFAULT 0;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;

    START TRANSACTION;
	
    SET @companyId = (SELECT id FROM weighsoft.companies c LIMIT 1);
   	SET @siteId = (SELECT id FROM weighsoft.sites s LIMIT 1);
   	SET @workstationIdOffset = IF((SELECT max(w.id) FROM weighsoft.workstations w) >= (SELECT min(w2.id) FROM production.workstations w2), ((SELECT max(w.id) FROM weighsoft.workstations w) - (SELECT min(w2.id) FROM production.workstations w2) + 1), 0);
   	SET @settingIdOffset = IF((SELECT max(s2.id) FROM weighsoft.settings s2) >= (SELECT min(s.id) FROM production.settings s), ((SELECT max(s2.id) FROM weighsoft.settings s2) - (SELECT min(s.id) FROM production.settings s) + 1), 0);
    SET @weighbridgeIdOffset = ((SELECT max(w2.id) FROM weighsoft.weighbridges w2) - (SELECT min(w.id) FROM production.weighbridges w) + 1);
    SET @productIdOffset = ((SELECT max(p2.id) FROM weighsoft.products p2) - (SELECT min(p.id) FROM production.products p) + 1);
    SET @usertypeIdOffset = ((SELECT max(u2.id) FROM weighsoft.usertypes u2) - (SELECT min(u.id) FROM production.usertypes u) + 1);
    SET @userIdOffset = ((SELECT max(u.id) FROM weighsoft.users u) - (SELECT min(u2.id) FROM production.users u2) + 1);
    SET @transactionIdOffset = ((SELECT max(t2.id) FROM weighsoft.transactions t2) - (SELECT min(t.id) FROM production.transactions t) + 1);
    SET @weighingheaderIdOffset = ((SELECT max(w2.id) FROM weighsoft.weighingheaders w2) - (SELECT min(w.id) FROM production.weighingheaders w) + 1);
    SET @weighingtransactionIdOffset = ((SELECT max(w2.id) FROM weighsoft.weighingtransactions w2) - (SELECT min(w.id) FROM weighsoft.weighingtransactions w) + 1);


	INSERT INTO weighsoft.settings (id, name, haulier, stored_tares, numberplate_1, numberplate_2, numberplate_3, numberplate_recognition, business_partner, use_product_list, type_of_weighing, first_can_axel, second_can_axel, goods_type, print_ticket, reprint, custom_fields, user_defined_input1, user_defined_name1, user_defined_val1, user_defined_rep1, user_defined_input2, user_defined_name2, user_defined_val2, user_defined_rep2, user_defined_input3, user_defined_name3, user_defined_val3, user_defined_rep3, user_defined_input4, user_defined_name4, user_defined_val4, user_defined_rep4, user_defined_input5, user_defined_name5, user_defined_val5, user_defined_rep5, user_defined_input6, user_defined_name6, user_defined_val6, user_defined_rep6, user_defined_input7, user_defined_name7, user_defined_val7, user_defined_rep7, user_defined_input8, user_defined_name8, user_defined_val8, user_defined_rep8, user_defined_input9, user_defined_name9, user_defined_val9, user_defined_rep9, user_defined_input10, user_defined_name10, user_defined_val10, user_defined_rep10, user_defined_input11, user_defined_name11, user_defined_val11, user_defined_rep11, user_defined_input12, user_defined_name12, user_defined_val12, user_defined_rep12, user_defined_input13, user_defined_name13, user_defined_val13, user_defined_rep13, user_defined_input14, user_defined_name14, user_defined_val14, user_defined_rep14, user_defined_input15, user_defined_name15, user_defined_val15, user_defined_rep15, user_defined_input16, user_defined_name16, user_defined_val16, user_defined_rep16, user_defined_input17, user_defined_name17, user_defined_val17, user_defined_rep17, user_defined_input18, user_defined_name18, user_defined_val18, user_defined_rep18, user_defined_input19, user_defined_name19, user_defined_val19, user_defined_rep19, user_defined_input20, user_defined_name20, user_defined_val20, user_defined_rep20, AS_400_path, export_AS400, silo_verification, use_cameras, display_cameras, print_cameras_on_ticket, ticket_header, display_custom_header_img, ticket_footer, display_custom_footer_img, company_id, updated_at , created_at, `2nd_weighing`, invoice_enabled, contract_enabled, moisture_deduction_level, prefix, enable_moisture, enable_handling, pallet_enabled, tares_enabled)
	SELECT (id + @settingIdOffset) AS id, name, haulier, stored_tares, numberplate_1, numberplate_2, numberplate_3, numberplate_recognition, business_partner, use_product_list, type_of_weighing, first_can_axel, second_can_axel, goods_type, print_ticket, reprint, custom_fields, user_defined_input1, user_defined_name1, user_defined_val1, user_defined_rep1, user_defined_input2, user_defined_name2, user_defined_val2, user_defined_rep2, user_defined_input3, user_defined_name3, user_defined_val3, user_defined_rep3, user_defined_input4, user_defined_name4, user_defined_val4, user_defined_rep4, user_defined_input5, user_defined_name5, user_defined_val5, user_defined_rep5, user_defined_input6, user_defined_name6, user_defined_val6, user_defined_rep6, user_defined_input7, user_defined_name7, user_defined_val7, user_defined_rep7, user_defined_input8, user_defined_name8, user_defined_val8, user_defined_rep8, user_defined_input9, user_defined_name9, user_defined_val9, user_defined_rep9, user_defined_input10, user_defined_name10, user_defined_val10, user_defined_rep10, user_defined_input11, user_defined_name11, user_defined_val11, user_defined_rep11, user_defined_input12, user_defined_name12, user_defined_val12, user_defined_rep12, user_defined_input13, user_defined_name13, user_defined_val13, user_defined_rep13, user_defined_input14, user_defined_name14, user_defined_val14, user_defined_rep14, user_defined_input15, user_defined_name15, user_defined_val15, user_defined_rep15, user_defined_input16, user_defined_name16, user_defined_val16, user_defined_rep16, user_defined_input17, user_defined_name17, user_defined_val17, user_defined_rep17, user_defined_input18, user_defined_name18, user_defined_val18, user_defined_rep18, user_defined_input19, user_defined_name19, user_defined_val19, user_defined_rep19, user_defined_input20, user_defined_name20, user_defined_val20, user_defined_rep20, AS_400_path, export_AS400, silo_verification, use_cameras, display_cameras, print_cameras_on_ticket, ticket_header, display_custom_header_img, ticket_footer, display_custom_footer_img, @companyId AS company_id, updated_at , created_at, `2nd_weighing`, invoice_enabled, contract_enabled, moisture_deduction_level, prefix, enable_moisture, enable_handling, pallet_enabled, tares_enabled 
	FROM production.settings ;

	INSERT INTO weighsoft.workstations (id, workstation_type, workstation_name, workstation_active, site_id, company_id, updated_at, created_at, deleted_at)
	SELECT (id + @workstationIdOffset) AS id, workstation_type, workstation_name, workstation_active, @siteId AS site_id, @companyId AS company_id, updated_at, created_at, deleted_at
	FROM production.workstations ;

	INSERT INTO weighsoft.weighbridges (id, name, ip_address, code, port_num, baud_rate, data_bits, parity, stop_bits, weight_reg, weight_sep, weight_num_amt, weight_special, decimal_places,stable_samples, manual, in_reverse, weight, workstation_id, site_id, company_id, weighing_transaction_flag, updated_at, created_at, deleted_at)
	SELECT (id + @weighbridgeIdOffset) AS id, name, ip_address, code, port_num, baud_rate, data_bits, parity, stop_bits, weight_reg, weight_sep, weight_num_amt, weight_special, decimal_places, stable_samples, manual, in_reverse, weight, workstation_id, @siteId AS site_id, @companyId AS company_id, weighing_transaction_flag, updated_at, created_at, deleted_at 
	FROM production.weighbridges ;

	INSERT INTO weighsoft.products (id, code, name, vat, company_id, updated_at, created_at, deleted_at, purchase_price, sale_price)
	SELECT (id + @productIdOffset) AS id, code, name, vat, @companyId AS company_id, updated_at, created_at, deleted_at, purchase_price, sale_price
	FROM production.products p;

	INSERT INTO weighsoft.usertypes (id, usertypes, `level`, companies, sites, workstations, weighbridges, cameras, weigh_types, weighing, verify, reprint, business_partner, products, hauliers, stored_tares, rfid_vehicle, axel_types, axel_settings, transaction_report, exception_report, users, user_types, updated_at, created_at)
	SELECT (ut.id + @usertypeIdOffset) AS id, usertypes, `level`, companies, sites, workstations, weighbridges, cameras, weigh_types, weighing, verify, reprint, business_partner, products, hauliers, stored_tares, rfid_vehicle, axel_types, axel_settings, transaction_report, exception_report, users, user_types, updated_at, created_at 
	FROM production.usertypes ut;

	INSERT INTO weighsoft.users (id, firstname, lastname, contact_num, email, password, role_id, site_id, workstations_id, company_id, token, updated_at, created_at, fingerprint, deleted_at)
	SELECT (id + @userIdOffset) AS id, firstname, lastname, contact_num, email, password, (role_id + @usertypeIdOffset) AS role_id, @siteId as site_id, (workstations_id + @workstationIdOffset) AS workstations_id, @companyId as company_id, token, updated_at, created_at, fingerprint, deleted_at 
	FROM production.users u2 
	WHERE u2.email NOT IN (SELECT email FROM weighsoft.users u);

	INSERT INTO weighsoft.transactions (id, current_id, settings_id, site_id, company_id, updated_at, created_at)
	SELECT (id + @transactionIdOffset) AS id, current_id, (settings_id + @settingIdOffset) AS settings_id, @siteId AS site_id, @companyId AS company_id, updated_at, created_at 
	FROM production.transactions ;

	INSERT INTO weighsoft.weighingheaders (id, `transaction`, settings_id, RegNumber, RegNumber2, RegNumber3, Custom1, Custom2, Custom3, Custom4, Custom5, Custom6, Custom7, Custom8, Custom9, Custom10, Custom11, Custom12, Custom13, Custom14, Custom15, Custom16, Custom17, Custom18, Custom19, Custom20, FirstWeight, SecondWeight, TotalWeight, NettWeight, businesspartner_id, product_id, grade_id, haulier_id, weighbridge_id, site_id, company_id, updated_at, created_at, deleted_at, reason, status, price, moisture_deduction, handling_charges, pallet_id, pallet_charges, pallet_count, tare_id, firstWeightUserId, secondWeightUserId, verifyUserId, deletedUserId)
	SELECT (id + @weighingheaderIdOffset) AS id, `transaction`, (settings_id + @settingIdOffset) AS settings_id, RegNumber, RegNumber2, RegNumber3, Custom1, Custom2, Custom3, Custom4, Custom5, Custom6, Custom7, Custom8, Custom9, Custom10, Custom11, Custom12, Custom13, Custom14, Custom15, Custom16, Custom17, Custom18, Custom19, Custom20, FirstWeight, SecondWeight, TotalWeight, NettWeight, businesspartner_id, IF(product_id IS NULL, NULL, product_id + @productIdOffset) AS product_id, grade_id, haulier_id, weighbridge_id + @weighbridgeIdOffset, @siteId AS site_id, @companyId as company_id, updated_at, created_at, deleted_at, reason, status, price, moisture_deduction, handling_charges, pallet_id, pallet_charges, pallet_count, tare_id, (SELECT u.id FROM weighsoft.users u, production.users u2 WHERE wh.firstWeightUserId = u2.id AND u.email = u2.email) AS firstWeightUser, (SELECT u.id FROM weighsoft.users u, production.users u2 WHERE wh.secondWeightUserId = u2.id AND u.email = u2.email) AS secondWeightUser, (SELECT u.id FROM weighsoft.users u, production.users u2 WHERE wh.verifyUserId = u2.id AND u.email = u2.email) AS verifyUserId, (SELECT u.id FROM weighsoft.users u, production.users u2 WHERE wh.deletedUserId = u2.id AND u.email = u2.email) AS deletedUserId
	FROM production.weighingheaders wh;

	INSERT INTO weighsoft.weighingtransactions (id, Status, Weight1, Weight2, Weight3, Weight4, Weight5, Weight6, WeightTotal, weighing_header_id, site_id, workstation_id, company_id, updated_at, created_at, deleted_at, AxelSetups)
	SELECT (id + @weighingtransactionIdOffset) AS id, Status, Weight1, Weight2, Weight3, Weight4, Weight5, Weight6, WeightTotal, (weighing_header_id + @weighingheaderIdOffset) AS weighing_header_id, @siteId as site_id, workstation_id, @companyId AS company_id, updated_at, created_at, deleted_at, AxelSetups 
	FROM production.weighingtransactions;

    INSERT INTO weighsoft.tares
    SELECT *
    FROM production.tares;

	IF `_rollback` THEN
		ROLLBACK;
		SELECT 'Changes were rolled back due to an error' AS message;
	ELSE 
		COMMIT;
	    SELECT 'Changes successfully committed' AS message;
	END IF;
END$$

DELIMITER ;
