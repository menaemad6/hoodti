-- Fix the discounts table id column issue
-- The id column should have a default value of gen_random_uuid()

-- First, let's check if the discounts table exists and fix the id column
DO $$
BEGIN
    -- If the table exists, make sure the id column has the proper default
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discounts') THEN
        -- Make sure the id column has the proper default value
        ALTER TABLE discounts ALTER COLUMN id SET DEFAULT gen_random_uuid();
        
        -- Make sure the id column is properly set as primary key
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                      WHERE table_name = 'discounts' 
                      AND constraint_type = 'PRIMARY KEY') THEN
            ALTER TABLE discounts ADD PRIMARY KEY (id);
        END IF;
    ELSE
        -- If the table doesn't exist, create it with the correct schema
        CREATE TABLE discounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code TEXT UNIQUE NOT NULL,
            description TEXT,
            discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
            discount_value DECIMAL(10,2) NOT NULL,
            minimum_order_amount DECIMAL(10,2) DEFAULT 0,
            maximum_discount DECIMAL(10,2),
            usage_limit INTEGER,
            used_count INTEGER DEFAULT 0,
            valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
            valid_until TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT true,
            tenant_id TEXT DEFAULT 'hoodti',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END $$;

-- Enable RLS on the discounts table
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for discounts
DROP POLICY IF EXISTS "Discounts are viewable by tenant" ON discounts;
CREATE POLICY "Discounts are viewable by tenant" ON discounts
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::text OR current_setting('app.tenant_id', true) IS NULL);

DROP POLICY IF EXISTS "Discounts are insertable by tenant" ON discounts;
CREATE POLICY "Discounts are insertable by tenant" ON discounts
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Discounts are updatable by tenant" ON discounts;
CREATE POLICY "Discounts are updatable by tenant" ON discounts
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Discounts are deletable by tenant" ON discounts;
CREATE POLICY "Discounts are deletable by tenant" ON discounts
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true)::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discounts_tenant_id ON discounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_is_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_discount_type ON discounts(discount_type);
