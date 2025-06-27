-- Migration to add government-based shipping fees
-- This migration modifies the settings table to store shipping fees per government

-- First, let's add a new column to store government shipping fees as JSON
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS government_shipping_fees JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the new column
COMMENT ON COLUMN settings.government_shipping_fees IS 'JSON array of government shipping fees with structure: [{"name": "Government Name", "shipping_fee": 0.00}]';

-- Insert default government shipping fees for Egypt
UPDATE settings 
SET government_shipping_fees = '[
  {"name": "Cairo", "shipping_fee": 0},
  {"name": "Giza", "shipping_fee": 0},
  {"name": "Alexandria", "shipping_fee": 0},
  {"name": "Dakahlia", "shipping_fee": 0},
  {"name": "Red Sea", "shipping_fee": 0},
  {"name": "Beheira", "shipping_fee": 0},
  {"name": "Fayoum", "shipping_fee": 0},
  {"name": "Gharbia", "shipping_fee": 0},
  {"name": "Ismailia", "shipping_fee": 0},
  {"name": "Menofia", "shipping_fee": 0},
  {"name": "Minya", "shipping_fee": 0},
  {"name": "Qaliubiya", "shipping_fee": 0},
  {"name": "New Valley", "shipping_fee": 0},
  {"name": "Suez", "shipping_fee": 0},
  {"name": "Aswan", "shipping_fee": 0},
  {"name": "Assiut", "shipping_fee": 0},
  {"name": "Beni Suef", "shipping_fee": 0},
  {"name": "Port Said", "shipping_fee": 0},
  {"name": "Damietta", "shipping_fee": 0},
  {"name": "South Sinai", "shipping_fee": 0},
  {"name": "Kafr El Sheikh", "shipping_fee": 0},
  {"name": "Matrouh", "shipping_fee": 0},
  {"name": "Luxor", "shipping_fee": 0},
  {"name": "Qena", "shipping_fee": 0},
  {"name": "North Sinai", "shipping_fee": 0},
  {"name": "Sohag", "shipping_fee": 0},
  {"name": "Sharqia", "shipping_fee": 0}
]'::jsonb
WHERE id = (SELECT id FROM settings LIMIT 1);

-- If no settings exist, create one with the default government shipping fees
INSERT INTO settings (shipping_fee, tax_rate, government_shipping_fees)
SELECT 5.99, 0.08, '[
  {"name": "Cairo", "shipping_fee": 0},
  {"name": "Giza", "shipping_fee": 0},
  {"name": "Alexandria", "shipping_fee": 0},
  {"name": "Dakahlia", "shipping_fee": 0},
  {"name": "Red Sea", "shipping_fee": 0},
  {"name": "Beheira", "shipping_fee": 0},
  {"name": "Fayoum", "shipping_fee": 0},
  {"name": "Gharbia", "shipping_fee": 0},
  {"name": "Ismailia", "shipping_fee": 0},
  {"name": "Menofia", "shipping_fee": 0},
  {"name": "Minya", "shipping_fee": 0},
  {"name": "Qaliubiya", "shipping_fee": 0},
  {"name": "New Valley", "shipping_fee": 0},
  {"name": "Suez", "shipping_fee": 0},
  {"name": "Aswan", "shipping_fee": 0},
  {"name": "Assiut", "shipping_fee": 0},
  {"name": "Beni Suef", "shipping_fee": 0},
  {"name": "Port Said", "shipping_fee": 0},
  {"name": "Damietta", "shipping_fee": 0},
  {"name": "South Sinai", "shipping_fee": 0},
  {"name": "Kafr El Sheikh", "shipping_fee": 0},
  {"name": "Matrouh", "shipping_fee": 0},
  {"name": "Luxor", "shipping_fee": 0},
  {"name": "Qena", "shipping_fee": 0},
  {"name": "North Sinai", "shipping_fee": 0},
  {"name": "Sohag", "shipping_fee": 0},
  {"name": "Sharqia", "shipping_fee": 0}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM settings); 