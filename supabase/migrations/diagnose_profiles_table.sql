-- DIAGNOSE PROFILES TABLE
-- This script helps identify issues with the profiles table that might cause signup errors

-- 1. Check the current table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check existing constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 3. Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 4. Check if there are any unique constraints on (id, tenant_id)
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass
AND contype = 'u'
AND pg_get_constraintdef(oid) LIKE '%id%tenant_id%';

-- 5. Check current RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 6. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- 7. Test a simple insert to see what happens
-- This will help identify the exact error
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test@example.com';
  test_tenant TEXT := 'test-tenant';
BEGIN
  RAISE NOTICE 'Testing insert with user_id: %, email: %, tenant: %', test_user_id, test_email, test_tenant;
  
  BEGIN
    INSERT INTO public.profiles (id, email, tenant_id, created_at, updated_at)
    VALUES (test_user_id, test_email, test_tenant, NOW(), NOW());
    RAISE NOTICE 'Insert successful';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Insert failed with error: %', SQLERRM;
  END;
END $$;

-- 8. Check if there are any existing profiles with the same structure
SELECT 
  COUNT(*) as total_profiles,
  COUNT(DISTINCT tenant_id) as unique_tenants
FROM public.profiles;

-- 9. Show sample of existing profiles
SELECT 
  id,
  email,
  tenant_id,
  created_at
FROM public.profiles 
LIMIT 5; 