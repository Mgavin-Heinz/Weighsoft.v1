ALTER TABLE `weighsoft`.`settings` 
ADD COLUMN IF NOT EXISTS `measure_type` CHAR(10) NOT NULL DEFAULT 'false' AFTER `workstation_id`;

ALTER TABLE `weighsoft`.`settings` 
CHANGE COLUMN `measure_type` `measure_type` CHAR(10) NULL DEFAULT 'KG' ;
