ALTER TABLE `weighsoft`.`settings` 
ADD COLUMN IF NOT EXISTS `deduct_flow` CHAR(10) NOT NULL DEFAULT 'default' AFTER `measure_type`;


ALTER TABLE `weighsoft`.`settings` 
CHANGE COLUMN `deduct_flow` `deduct_flow` CHAR(10) NULL DEFAULT NULL;
