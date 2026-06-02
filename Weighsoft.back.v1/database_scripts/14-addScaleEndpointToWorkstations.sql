-- Add per-workstation Node-RED scale endpoint
-- Stores Node-RED host:port used by this workstation for scale operations
USE weighsoft;

ALTER TABLE workstations
ADD COLUMN scale_endpoint VARCHAR(255) NULL
COMMENT 'Node-RED scale endpoint (host:port)';
