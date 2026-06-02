-- Add shared_workstation column to sites table
-- Allows 1st and 2nd weight on different workstations at the same site
-- When enabled, weighing list, verification, and reprint screens filter by site instead of workstation
USE weighsoft;

ALTER TABLE `sites`
ADD COLUMN `shared_workstation` VARCHAR(255) NOT NULL DEFAULT 'No'
AFTER `override_silo`;
