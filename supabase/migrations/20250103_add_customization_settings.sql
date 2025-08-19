    -- Migration to add customization settings
    -- This migration adds a customizations column to store customization fees and product availability

    -- Add the customizations column to the settings table
    ALTER TABLE settings 
    ADD COLUMN IF NOT EXISTS customizations JSONB DEFAULT '{
    "text_fee": 5.00,
    "image_fee": 30.00,
    "products": {
        "hoodies": {
        "enabled": true,
        "base_price": 150.00
        },
        "sweatshirts": {
        "enabled": true,
        "base_price": 120.00
        },
        "regular_tshirts": {
        "enabled": true,
        "base_price": 80.00
        },
        "boxy_tshirts": {
        "enabled": true,
        "base_price": 85.00
        },
        "oversized_tshirts": {
        "enabled": true,
        "base_price": 90.00
        },
        "slim_fit_tshirts": {
        "enabled": true,
        "base_price": 75.00
        },
        "polo_shirts": {
        "enabled": true,
        "base_price": 95.00
        },
        "polo_baskota": {
        "enabled": true,
        "base_price": 100.00
        }
    }
    }'::jsonb;

    -- Add a comment to document the new column
    COMMENT ON COLUMN settings.customizations IS 'JSON object containing customization fees and product availability settings';

    -- Update existing settings to have default customization settings if they don''t exist
    UPDATE settings 
    SET customizations = '{
    "text_fee": 5.00,
    "image_fee": 30.00,
    "products": {
        "hoodies": {
        "enabled": true,
        "base_price": 150.00
        },
        "sweatshirts": {
        "enabled": true,
        "base_price": 120.00
        },
        "regular_tshirts": {
        "enabled": true,
        "base_price": 80.00
        },
        "boxy_tshirts": {
        "enabled": true,
        "base_price": 85.00
        },
        "oversized_tshirts": {
        "enabled": true,
        "base_price": 90.00
        },
        "slim_fit_tshirts": {
        "enabled": true,
        "base_price": 75.00
        },
        "polo_shirts": {
        "enabled": true,
        "base_price": 95.00
        },
        "polo_baskota": {
        "enabled": true,
        "base_price": 100.00
        }
    }
    }'::jsonb
    WHERE customizations IS NULL;

    -- If no settings exist, create one with the default customization settings
    INSERT INTO settings (shipping_fee, tax_rate, government_shipping_fees, delivery_delay, customizations)
    SELECT 5.99, 0.08, '[]'::jsonb, 0, '{
    "text_fee": 5.00,
    "image_fee": 30.00,
    "products": {
        "hoodies": {
        "enabled": true,
        "base_price": 150.00
        },
        "sweatshirts": {
        "enabled": true,
        "base_price": 120.00
        },
        "regular_tshirts": {
        "enabled": true,
        "base_price": 80.00
        },
        "boxy_tshirts": {
        "enabled": true,
        "base_price": 85.00
        },
        "oversized_tshirts": {
        "enabled": true,
        "base_price": 90.00
        },
        "slim_fit_tshirts": {
        "enabled": true,
        "base_price": 75.00
        },
        "polo_shirts": {
        "enabled": true,
        "base_price": 95.00
        },
        "polo_baskota": {
        "enabled": true,
        "base_price": 100.00
        }
    }
    }'::jsonb
    WHERE NOT EXISTS (SELECT 1 FROM settings);
