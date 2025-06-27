-- Migration to add delivery delay setting
-- This migration adds a delivery_delay column to control how many days ahead delivery slots become available

-- Add the delivery_delay column to the settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS delivery_delay INTEGER DEFAULT 0;

-- Add a comment to document the new column
COMMENT ON COLUMN settings.delivery_delay IS 'Number of days to add to current date before delivery slots become available (e.g., 2 means delivery slots start from 2 days from today)';

-- Update existing settings to have a default delay of 0 days
UPDATE settings 
SET delivery_delay = 0
WHERE delivery_delay IS NULL;

-- If no settings exist, create one with the default delivery delay
INSERT INTO settings (shipping_fee, tax_rate, government_shipping_fees, delivery_delay)
SELECT 5.99, 0.08, '[]'::jsonb, 0
WHERE NOT EXISTS (SELECT 1 FROM settings); 