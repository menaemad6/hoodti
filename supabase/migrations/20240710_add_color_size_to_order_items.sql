-- Add selected_color and selected_size columns to order_items table
ALTER TABLE "public"."order_items" 
ADD COLUMN IF NOT EXISTS "selected_color" TEXT,
ADD COLUMN IF NOT EXISTS "selected_size" TEXT;

-- Add comment explaining the purpose of these columns
COMMENT ON COLUMN "public"."order_items"."selected_color" IS 'The color variant selected by the customer for this order item';
COMMENT ON COLUMN "public"."order_items"."selected_size" IS 'The size variant selected by the customer for this order item'; 