-- Add product_points column to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS product_points INTEGER DEFAULT 1;

-- Add comment to the new column
COMMENT ON COLUMN public.settings.product_points IS 'Number of points awarded per product purchase';

-- Update existing settings to have default product_points value
UPDATE public.settings 
SET product_points = 1 
WHERE product_points IS NULL;
