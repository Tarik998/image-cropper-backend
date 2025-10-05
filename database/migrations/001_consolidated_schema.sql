-- Creates the final configs table structure

CREATE TABLE IF NOT EXISTS configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Configuration',
    logo_position VARCHAR(50) NOT NULL DEFAULT 'bottom-right',
    logo_scale DECIMAL(5,3) NOT NULL DEFAULT 0.25,
    logo_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints (only if they don't already exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_logo_scale_max' AND table_name = 'configs'
    ) THEN
        ALTER TABLE configs ADD CONSTRAINT check_logo_scale_max CHECK (logo_scale <= 0.25);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_logo_scale_positive' AND table_name = 'configs'
    ) THEN
        ALTER TABLE configs ADD CONSTRAINT check_logo_scale_positive CHECK (logo_scale > 0);
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_configs_created_at ON configs(created_at);
CREATE INDEX IF NOT EXISTS idx_configs_name ON configs(name);

-- Insert default configuration if table is empty
INSERT INTO configs (name, logo_position, logo_scale) 
SELECT 'Default Configuration', 'bottom-right', 0.15
WHERE NOT EXISTS (SELECT 1 FROM configs);