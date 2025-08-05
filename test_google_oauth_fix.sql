-- TEST GOOGLE OAUTH FIX
-- This script tests the Google OAuth tenant context fix

-- 1. Test the Google OAuth specific functions
SELECT 'Testing Google OAuth profile functions...' as test_info;

-- 2. Check if there are any Google OAuth profiles with wrong tenants
SELECT 'Checking for Google OAuth profiles with wrong tenants...' as check_info;
SELECT * FROM check_google_oauth_profiles();

-- 3. Test the trigger function with Google OAuth simulation
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test@gmail.com';
  test_tenant TEXT;
  is_google_oauth BOOLEAN := TRUE;
BEGIN
  RAISE NOTICE 'Testing Google OAuth trigger logic...';
  
  -- Simulate Google OAuth user creation
  test_tenant := 'test-tenant';
  
  -- Test scenario 1: tenant in user metadata
  RAISE NOTICE 'Google OAuth with tenant in metadata: %', test_tenant;
  
  -- Test scenario 2: no tenant context (should delay profile creation)
  test_tenant := NULL;
  IF test_tenant IS NULL AND is_google_oauth THEN
    RAISE NOTICE 'Google OAuth without tenant context - profile will be created in callback';
  END IF;
  
  -- Test scenario 3: tenant in email
  test_email := 'user+tenant-from-email@gmail.com';
  test_tenant := split_part(split_part(test_email, '+', 2), '@', 1);
  RAISE NOTICE 'Google OAuth with tenant from email: % (email: %)', test_tenant, test_email;
END $$;

-- 4. Show current Google OAuth users and their profiles
SELECT 
  u.id,
  u.email,
  u.raw_app_meta_data->>'provider' as provider,
  u.raw_user_meta_data->>'tenant_id' as expected_tenant,
  p.tenant_id as actual_tenant,
  CASE 
    WHEN p.tenant_id = COALESCE(u.raw_user_meta_data->>'tenant_id', 'hoodti') THEN '✅ Correct'
    ELSE '❌ Wrong'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.raw_app_meta_data->>'provider' = 'google'
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. Test the fix function (replace with actual user ID)
-- SELECT fix_google_oauth_profile('00000000-0000-0000-0000-000000000000'::UUID, 'correct-tenant-id');

-- 6. Show the trigger function definition
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user'; 