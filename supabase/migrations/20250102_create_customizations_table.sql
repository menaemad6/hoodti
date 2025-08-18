-- Create customizations table
CREATE TABLE IF NOT EXISTS customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL, -- Store as text since we're not linking to tenants table
  base_product_type VARCHAR(50) NOT NULL,
  base_product_size VARCHAR(10) NOT NULL,
  base_product_color VARCHAR(20) NOT NULL,
  design_data JSONB NOT NULL,
  preview_image_url TEXT,
  total_customization_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customizations_user_id ON customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_customizations_tenant_id ON customizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customizations_created_at ON customizations(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own customizations
CREATE POLICY "Users can view own customizations" ON customizations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own customizations
CREATE POLICY "Users can insert own customizations" ON customizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own customizations
CREATE POLICY "Users can update own customizations" ON customizations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own customizations
CREATE POLICY "Users can delete own customizations" ON customizations
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Admins can view all customizations
CREATE POLICY "Admins can view all customizations" ON customizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_customizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customizations_updated_at
  BEFORE UPDATE ON customizations
  FOR EACH ROW
  EXECUTE FUNCTION update_customizations_updated_at();
