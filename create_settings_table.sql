-- Create the settings table for global site settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.99,
  tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.08,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default values
INSERT INTO settings (shipping_fee, tax_rate) 
VALUES (5.99, 0.08);

-- Create RLS (Row Level Security) policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read settings
CREATE POLICY "Allow anyone to read settings" 
ON settings FOR SELECT 
TO authenticated
USING (true);

-- Only allow admins to update settings
CREATE POLICY "Allow admins to update settings" 
ON settings FOR UPDATE 
TO authenticated
USING (auth.jwt() ? 'role' = 'admin');

-- Only allow admins to insert settings
CREATE POLICY "Allow admins to insert settings" 
ON settings FOR INSERT 
TO authenticated
WITH CHECK (auth.jwt() ? 'role' = 'admin');

-- Only allow admins to delete settings
CREATE POLICY "Allow admins to delete settings" 
ON settings FOR DELETE 
TO authenticated
USING (auth.jwt() ? 'role' = 'admin');

-- Comment on table and columns for better documentation
COMMENT ON TABLE settings IS 'Store global settings for the application';
COMMENT ON COLUMN settings.shipping_fee IS 'Standard shipping fee applied to orders';
COMMENT ON COLUMN settings.tax_rate IS 'Tax rate as a decimal (e.g., 0.08 for 8%)'; 