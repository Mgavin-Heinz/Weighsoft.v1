UPDATE `weighingheaders` SET `TotalWeight` = ABS(`FirstWeight` - `SecondWeight`);

ALTER TABLE `weighingheaders` ADD COLUMN `NettWeight` INT AFTER `TotalWeight`;

-- Set NettWeight to TotalWeight if moisture_deduction_level is not set
UPDATE weighingheaders
JOIN settings ON settings.id = weighingheaders.settings_id
SET
    weighingheaders.NettWeight = (
        CAST(weighingheaders.TotalWeight AS DECIMAL(10,2))
        - CAST(weighingheaders.pallet_charges AS DECIMAL(10,2)))
        * IF(
            settings.enable_moisture = 'true'
            AND CAST(settings.moisture_deduction_level AS DECIMAL(10, 2)) < CAST(weighingheaders.moisture_deduction AS DECIMAL(10, 2)),
            ((100 - CAST(weighingheaders.moisture_deduction AS DECIMAL(10, 2))) / (100 - CAST(settings.moisture_deduction_level AS DECIMAL(10, 2)))), 0) * (100 - CAST(weighingheaders.handling_charges AS DECIMAL(10,2)) / 100);
