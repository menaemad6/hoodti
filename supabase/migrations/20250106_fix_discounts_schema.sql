-- Fix discounts table schema to match the application code
-- This migration renames existing columns to match the new interface

-- First, add the missing discount_type column if it doesn't exist
ALTER TABLE discounts 
ADD COLUMN IF NOT EXISTS discount_type TEXT NOT NULL DEFAULT 'percentage' 
CHECK (discount_type IN ('percentage', 'fixed'));

-- Rename existing columns to match the new schema
-- Note: We need to do this carefully to avoid data loss

-- Rename discount_percent to discount_value (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discounts' AND column_name = 'discount_percent') THEN
        ALTER TABLE discounts RENAME COLUMN discount_percent TO discount_value;
    END IF;
END $$;

-- Rename max_uses to usage_limit (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discounts' AND column_name = 'max_uses') THEN
        ALTER TABLE discounts RENAME COLUMN max_uses TO usage_limit;
    END IF;
END $$;

-- Rename current_uses to used_count (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discounts' AND column_name = 'current_uses') THEN
        ALTER TABLE discounts RENAME COLUMN current_uses TO used_count;
    END IF;
END $$;

-- Rename min_order_amount to minimum_order_amount (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discounts' AND column_name = 'min_order_amount') THEN
        ALTER TABLE discounts RENAME COLUMN min_order_amount TO minimum_order_amount;
    END IF;
END $$;

-- Rename active to is_active (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discounts' AND column_name = 'active') THEN
        ALTER TABLE discounts RENAME COLUMN active TO is_active;
    END IF;
END $$;

-- Rename start_date to valid_from (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discounts' AND column_name = 'start_date') THEN
        ALTER TABLE discounts RENAME COLUMN start_date TO valid_from;
    END IF;
END $$;

-- Rename end_date to valid_until (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'discounts' AND column_name = 'end_date') THEN
        ALTER TABLE discounts RENAME COLUMN end_date TO valid_until;
    END IF;
END $$;

-- Add maximum_discount column if it doesn't exist
ALTER TABLE discounts 
ADD COLUMN IF NOT EXISTS maximum_discount DECIMAL(10,2);

-- Add updated_at column if it doesn't exist
ALTER TABLE discounts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update existing records to have the correct discount_type
UPDATE discounts 
SET discount_type = 'percentage' 
WHERE discount_type = 'percentage' OR discount_type IS NULL;

-- Add comments to document the columns
COMMENT ON COLUMN discounts.discount_type IS 'Type of discount: percentage or fixed amount';
COMMENT ON COLUMN discounts.discount_value IS 'Discount value (percentage or fixed amount)';
COMMENT ON COLUMN discounts.usage_limit IS 'Maximum number of times this discount can be used';
COMMENT ON COLUMN discounts.used_count IS 'Number of times this discount has been used';
COMMENT ON COLUMN discounts.minimum_order_amount IS 'Minimum order amount required to use this discount';
COMMENT ON COLUMN discounts.maximum_discount IS 'Maximum discount amount (for percentage discounts)';
COMMENT ON COLUMN discounts.is_active IS 'Whether this discount is currently active';
COMMENT ON COLUMN discounts.valid_from IS 'Date when this discount becomes valid';
COMMENT ON COLUMN discounts.valid_until IS 'Date when this discount expires';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discounts_discount_type ON discounts(discount_type);
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_from ON discounts(valid_from);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_until ON discounts(valid_until);
