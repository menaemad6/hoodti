-- Update order_items table to support customizations
-- Add customization_id column
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS customization_id UUID REFERENCES customizations(id);

-- Make product_id nullable (since we can have either product_id OR customization_id)
ALTER TABLE order_items 
ALTER COLUMN product_id DROP NOT NULL;

-- Add constraint to ensure either product_id OR customization_id is present
-- Note: We'll add this constraint only if it doesn't exist to avoid errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'check_product_or_customization'
  ) THEN
    ALTER TABLE order_items 
    ADD CONSTRAINT check_product_or_customization 
    CHECK (product_id IS NOT NULL OR customization_id IS NOT NULL);
  END IF;
END $$;

-- Create index for customization_id
CREATE INDEX IF NOT EXISTS idx_order_items_customization_id ON order_items(customization_id);

-- Add RLS policy for customizations in orders
-- Users can view order items with their customizations
CREATE POLICY "Users can view order items with own customizations" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customizations 
      WHERE customizations.id = order_items.customization_id 
      AND customizations.user_id = auth.uid()
    )
  );

-- Users can insert order items with their customizations
CREATE POLICY "Users can insert order items with own customizations" ON order_items
  FOR INSERT WITH CHECK (
    customization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM customizations 
      WHERE customizations.id = customization_id 
      AND customizations.user_id = auth.uid()
    )
  );

-- Users can update order items with their customizations
CREATE POLICY "Users can update order items with own customizations" ON order_items
  FOR UPDATE USING (
    customization_id IS NULL OR
    EXISTS (
      SELECT 1 FROM customizations 
      WHERE customizations.id = customization_id 
      AND customizations.user_id = auth.uid()
    )
  );
