-- Test RLS policies for profiles table
-- Run this in your Supabase SQL editor to test

-- 1. Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 2. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- 3. Check current profiles count
SELECT COUNT(*) as total_profiles FROM profiles;

-- 4. Check if we can manually insert a test profile (replace with actual user ID)
-- Note: This will only work if you're authenticated as that user
/*
INSERT INTO profiles (id, email, tenant_id, created_at, updated_at)
VALUES 
    ('your-user-id-here'::UUID, 'test+tenant1@example.com', 'tenant1', NOW(), NOW())
ON CONFLICT (id, tenant_id) DO NOTHING;
*/

-- 5. Check if the database function works
-- SELECT create_profile_if_not_exists(
--     'your-user-id-here'::UUID,
--     'test-tenant-2',
--     'test+tenant2@example.com',
--     'Test User'
-- );

-- 6. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position; 