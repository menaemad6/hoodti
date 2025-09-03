-- Add videos column to products table
-- This migration adds a videos column to store YouTube video URLs as a JSONB array

-- Add videos column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the new column
COMMENT ON COLUMN products.videos IS 'Array of YouTube video URLs for product videos';

-- Create index for better performance when querying products with videos
CREATE INDEX IF NOT EXISTS idx_products_videos ON products USING GIN (videos);

-- Update existing products to have empty videos array if they don't have one
UPDATE products 
SET videos = '[]'::jsonb 
WHERE videos IS NULL;
