-- Add ticket_template to settings (normal vs thermal / 72mm browser ticket layout)
-- Default 'normal' preserves existing printing behaviour until changed in Settings UI
USE weighsoft;

ALTER TABLE `settings`
ADD COLUMN IF NOT EXISTS `ticket_template` VARCHAR(255) NOT NULL DEFAULT 'normal'
AFTER `print_ticket`;
