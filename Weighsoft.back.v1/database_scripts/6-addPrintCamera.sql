ALTER TABLE cameras ADD COLUMN print_camera VARCHAR(255) NOT NULL DEFAULT 'true' AFTER camera_active;
ALTER TABLE weighingcameras ADD COLUMN print_camera VARCHAR(255) NOT NULL DEFAULT 'true' AFTER company_id;
