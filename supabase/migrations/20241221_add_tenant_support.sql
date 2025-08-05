-- Migration to add multi-tenant support
-- This migration adds tenant_id to products, orders, discounts, delivery_slots, and settings tables

-- Add tenant_id column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'hoodti';

-- Add tenant_id column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'hoodti';

-- Add tenant_id column to discounts table (if it exists, otherwise create it)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discounts') THEN
        CREATE TABLE discounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code TEXT UNIQUE NOT NULL,
            description TEXT,
            discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
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
    ELSE
        ALTER TABLE discounts 
        ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'hoodti';
    END IF;
END $$;

-- Add tenant_id column to delivery_slots table (if it exists, otherwise create it)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delivery_slots') THEN
        CREATE TABLE delivery_slots (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            max_orders INTEGER DEFAULT 10,
            is_active BOOLEAN DEFAULT true,
            tenant_id TEXT DEFAULT 'hoodti',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    ELSE
        ALTER TABLE delivery_slots 
        ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'hoodti';
    END IF;
END $$;

-- Add tenant_id column to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'hoodti';

-- Add tenant_id column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'hoodti';

-- Add tenant_id column to wishlists table
ALTER TABLE wishlists 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'hoodti';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_tenant_id ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_discounts_tenant_id ON discounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_delivery_slots_tenant_id ON delivery_slots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_settings_tenant_id ON settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_tenant_id ON wishlists(tenant_id);

-- Add comments to document the new columns
COMMENT ON COLUMN products.tenant_id IS 'Tenant identifier for multi-tenant support';
COMMENT ON COLUMN orders.tenant_id IS 'Tenant identifier for multi-tenant support';
COMMENT ON COLUMN discounts.tenant_id IS 'Tenant identifier for multi-tenant support';
COMMENT ON COLUMN delivery_slots.tenant_id IS 'Tenant identifier for multi-tenant support';
COMMENT ON COLUMN settings.tenant_id IS 'Tenant identifier for multi-tenant support';
COMMENT ON COLUMN categories.tenant_id IS 'Tenant identifier for multi-tenant support';
COMMENT ON COLUMN wishlists.tenant_id IS 'Tenant identifier for multi-tenant support';

-- Create RLS policies for tenant isolation
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies for products
DROP POLICY IF EXISTS "Products are viewable by tenant" ON products;
CREATE POLICY "Products are viewable by tenant" ON products
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::text OR current_setting('app.tenant_id', true) IS NULL);

DROP POLICY IF EXISTS "Products are insertable by tenant" ON products;
CREATE POLICY "Products are insertable by tenant" ON products
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Products are updatable by tenant" ON products;
CREATE POLICY "Products are updatable by tenant" ON products
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Products are deletable by tenant" ON products;
CREATE POLICY "Products are deletable by tenant" ON products
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true)::text);

-- Create policies for orders
DROP POLICY IF EXISTS "Orders are viewable by tenant" ON orders;
CREATE POLICY "Orders are viewable by tenant" ON orders
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::text OR current_setting('app.tenant_id', true) IS NULL);

DROP POLICY IF EXISTS "Orders are insertable by tenant" ON orders;
CREATE POLICY "Orders are insertable by tenant" ON orders
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Orders are updatable by tenant" ON orders;
CREATE POLICY "Orders are updatable by tenant" ON orders
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true)::text);

-- Create policies for categories
DROP POLICY IF EXISTS "Categories are viewable by tenant" ON categories;
CREATE POLICY "Categories are viewable by tenant" ON categories
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::text OR current_setting('app.tenant_id', true) IS NULL);

DROP POLICY IF EXISTS "Categories are insertable by tenant" ON categories;
CREATE POLICY "Categories are insertable by tenant" ON categories
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Categories are updatable by tenant" ON categories;
CREATE POLICY "Categories are updatable by tenant" ON categories
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true)::text);

-- Create policies for settings
DROP POLICY IF EXISTS "Settings are viewable by tenant" ON settings;
CREATE POLICY "Settings are viewable by tenant" ON settings
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::text OR current_setting('app.tenant_id', true) IS NULL);

DROP POLICY IF EXISTS "Settings are insertable by tenant" ON settings;
CREATE POLICY "Settings are insertable by tenant" ON settings
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Settings are updatable by tenant" ON settings;
CREATE POLICY "Settings are updatable by tenant" ON settings
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true)::text);

-- Create policies for wishlists
DROP POLICY IF EXISTS "Wishlists are viewable by tenant" ON wishlists;
CREATE POLICY "Wishlists are viewable by tenant" ON wishlists
    FOR SELECT USING (tenant_id = current_setting('app.tenant_id', true)::text OR current_setting('app.tenant_id', true) IS NULL);

DROP POLICY IF EXISTS "Wishlists are insertable by tenant" ON wishlists;
CREATE POLICY "Wishlists are insertable by tenant" ON wishlists
    FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Wishlists are updatable by tenant" ON wishlists;
CREATE POLICY "Wishlists are updatable by tenant" ON wishlists
    FOR UPDATE USING (tenant_id = current_setting('app.tenant_id', true)::text);

DROP POLICY IF EXISTS "Wishlists are deletable by tenant" ON wishlists;
CREATE POLICY "Wishlists are deletable by tenant" ON wishlists
    FOR DELETE USING (tenant_id = current_setting('app.tenant_id', true)::text);

-- Create policies for discounts (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'discounts') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Discounts are viewable by tenant" ON discounts';
        EXECUTE 'CREATE POLICY "Discounts are viewable by tenant" ON discounts FOR SELECT USING (tenant_id = current_setting(''app.tenant_id'', true)::text OR current_setting(''app.tenant_id'', true) IS NULL)';
        
        EXECUTE 'DROP POLICY IF EXISTS "Discounts are insertable by tenant" ON discounts';
        EXECUTE 'CREATE POLICY "Discounts are insertable by tenant" ON discounts FOR INSERT WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::text)';
        
        EXECUTE 'DROP POLICY IF EXISTS "Discounts are updatable by tenant" ON discounts';
        EXECUTE 'CREATE POLICY "Discounts are updatable by tenant" ON discounts FOR UPDATE USING (tenant_id = current_setting(''app.tenant_id'', true)::text)';
    END IF;
END $$;

-- Create policies for delivery_slots (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delivery_slots') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Delivery slots are viewable by tenant" ON delivery_slots';
        EXECUTE 'CREATE POLICY "Delivery slots are viewable by tenant" ON delivery_slots FOR SELECT USING (tenant_id = current_setting(''app.tenant_id'', true)::text OR current_setting(''app.tenant_id'', true) IS NULL)';
        
        EXECUTE 'DROP POLICY IF EXISTS "Delivery slots are insertable by tenant" ON delivery_slots';
        EXECUTE 'CREATE POLICY "Delivery slots are insertable by tenant" ON delivery_slots FOR INSERT WITH CHECK (tenant_id = current_setting(''app.tenant_id'', true)::text)';
        
        EXECUTE 'DROP POLICY IF EXISTS "Delivery slots are updatable by tenant" ON delivery_slots';
        EXECUTE 'CREATE POLICY "Delivery slots are updatable by tenant" ON delivery_slots FOR UPDATE USING (tenant_id = current_setting(''app.tenant_id'', true)::text)';
    END IF;
END $$; 