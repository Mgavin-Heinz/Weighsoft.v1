-- Add ESP32 relay number fields to workstations table
-- Each field stores which relay (1-8) on the ESP32 device controls that entity
-- Multiple entities can share the same ESP32 device (same IP) but use different relay numbers
USE weighsoft;

ALTER TABLE workstations ADD COLUMN incoming_boom_relay TINYINT NULL COMMENT 'ESP32 relay number (1-8) for incoming boom';

ALTER TABLE workstations ADD COLUMN exiting_boom_relay TINYINT NULL COMMENT 'ESP32 relay number (1-8) for exiting boom';

ALTER TABLE workstations ADD COLUMN incoming_light_relay TINYINT NULL COMMENT 'ESP32 relay number (1-8) for incoming light';

ALTER TABLE workstations ADD COLUMN exiting_light_relay TINYINT NULL COMMENT 'ESP32 relay number (1-8) for exiting light';


