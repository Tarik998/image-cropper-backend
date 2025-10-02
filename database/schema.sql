

-- database schema

CREATE TABLE IF NOT EXISTS cropping_configs (
  id SERIAL PRIMARY KEY,
  logo_position VARCHAR(50) NOT NULL DEFAULT 'bottom-right',
  scale_down DECIMAL(5,3) NOT NULL DEFAULT 0.25,
  logo_image TEXT,
  image_id INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration (without logo initially)
INSERT INTO cropping_configs (logo_position, scale_down, image_id) 
VALUES ('bottom-right', 0.25, 1)
ON CONFLICT DO NOTHING;
