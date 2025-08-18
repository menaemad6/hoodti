-- This migration only creates the customizations table
-- Tenant customization settings are stored locally in tenants.ts

-- Create customizations table
CREATE TABLE IF NOT EXISTS customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL, -- Store as text since we're not linking to tenants table
  base_product_type TEXT NOT NULL,
  base_product_size TEXT NOT NULL,
  base_product_color TEXT NOT NULL,
  design_data JSONB NOT NULL,
  total_customization_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own customizations" ON customizations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customizations" ON customizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customizations" ON customizations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customizations" ON customizations
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customizations_user_id ON customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_customizations_tenant_id ON customizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customizations_created_at ON customizations(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_customizations_updated_at
  BEFORE UPDATE ON customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_customizations_updated_at();
