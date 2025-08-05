-- Test script to verify multi-tenant profile support
-- This script tests if we can create multiple profiles for the same user across different tenants

-- First, let's check the current table structure
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
    AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.ordinal_position;

-- Check if there are any existing profiles for testing
SELECT id, tenant_id, email, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Test: Try to create multiple profiles for the same user (if any exist)
-- This will help us verify if the schema change worked
-- Note: Replace 'test-user-id' with an actual user ID from your auth.users table

-- Example test (uncomment and modify as needed):
/*
INSERT INTO profiles (id, email, tenant_id, created_at, updated_at)
VALUES 
    ('test-user-id', 'user+tenant1@example.com', 'tenant1', NOW(), NOW()),
    ('test-user-id', 'user+tenant2@example.com', 'tenant2', NOW(), NOW())
ON CONFLICT (id, tenant_id) DO NOTHING;

-- Check if both profiles were created
SELECT * FROM profiles WHERE id = 'test-user-id';
*/ 