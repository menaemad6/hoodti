-- Test script to check customization order flow
-- Run this in your Supabase SQL editor to verify the setup

-- 1. Check if customizations table exists and has the right structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'customizations'
ORDER BY ordinal_position;

-- 2. Check if order_items table has customization_id column
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- 3. Check if the constraint exists
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'check_product_or_customization';

-- 4. Test inserting a sample customization
INSERT INTO customizations (
  user_id,
  tenant_id,
  base_product_type,
  base_product_size,
  base_product_color,
  design_data,
  total_customization_cost
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'hoodti',
  'hoodie',
  'M',
  '#000000',
  '{"texts": [], "images": []}'::jsonb,
  10.00
) RETURNING id;

-- 5. Test inserting an order item with customization_id
-- (Replace the IDs with actual values from step 4)
INSERT INTO order_items (
  order_id,
  product_id,
  customization_id,
  quantity,
  price_at_time
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual order ID
  NULL,
  '00000000-0000-0000-0000-000000000000', -- Replace with customization ID from step 4
  1,
  25.00
);

-- 6. Verify the order item was created
SELECT * FROM order_items WHERE customization_id IS NOT NULL;
