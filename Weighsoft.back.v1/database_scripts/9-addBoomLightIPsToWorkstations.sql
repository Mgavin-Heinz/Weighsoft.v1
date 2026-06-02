-- Add ESP32 Boom and Light IP address columns to workstations table
-- For systems that don't follow Laravel migrations
-- Compatible with MySQL 5.7+ and MariaDB 10.2+

-- Note: If columns already exist, these statements will fail with an error
-- This is intentional to prevent duplicate columns
-- Run this script only once per database
USE weighsoft;

ALTER TABLE `workstations` 
ADD COLUMN `incoming_boom_ip` VARCHAR(255) NULL DEFAULT NULL 
AFTER `workstation_active`;

ALTER TABLE `workstations` 
ADD COLUMN `exiting_boom_ip` VARCHAR(255) NULL DEFAULT NULL 
AFTER `incoming_boom_ip`;

ALTER TABLE `workstations` 
ADD COLUMN `incoming_light_ip` VARCHAR(255) NULL DEFAULT NULL 
AFTER `exiting_boom_ip`;

ALTER TABLE `workstations` 
ADD COLUMN `exiting_light_ip` VARCHAR(255) NULL DEFAULT NULL 
AFTER `incoming_light_ip`;


