-- Test script to verify profile creation is working
-- Run this in your Supabase SQL editor to test

-- 1. Check current table structure
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

-- 2. Check current profiles
SELECT id, tenant_id, email, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Test the database function (replace with actual user ID)
-- SELECT create_profile_if_not_exists(
--     '00000000-0000-0000-0000-000000000000'::UUID,  -- Replace with actual user ID
--     'test-tenant-1',
--     'test+tenant1@example.com',
--     'Test User'
-- );

-- 4. Check if we can manually insert profiles
-- INSERT INTO profiles (id, email, tenant_id, created_at, updated_at)
-- VALUES 
--     ('00000000-0000-0000-0000-000000000000'::UUID, 'test+tenant1@example.com', 'tenant1', NOW(), NOW()),
--     ('00000000-0000-0000-0000-000000000000'::UUID, 'test+tenant2@example.com', 'tenant2', NOW(), NOW())
-- ON CONFLICT (id, tenant_id) DO NOTHING;

-- 5. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles'; 