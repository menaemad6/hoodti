-- TEST TENANT FIX
-- This script tests the tenant context fix

-- 1. Test setting tenant context
SELECT set_tenant_context_for_profile('test-tenant');

-- 2. Check if context was set
SELECT current_setting('app.tenant_id', true) as current_tenant;

-- 3. Test the trigger function logic with different scenarios
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test@example.com';
  test_tenant TEXT;
BEGIN
  -- Test scenario 1: tenant in user metadata
  test_tenant := 'tenant-from-metadata';
  RAISE NOTICE 'Testing with tenant in metadata: %', test_tenant;
  
  -- Test scenario 2: tenant in session context
  PERFORM set_tenant_context_for_profile('tenant-from-context');
  test_tenant := current_setting('app.tenant_id', true);
  RAISE NOTICE 'Testing with tenant from context: %', test_tenant;
  
  -- Test scenario 3: tenant in email (user+tenant@domain.com)
  test_email := 'user+tenant-from-email@example.com';
  test_tenant := split_part(split_part(test_email, '+', 2), '@', 1);
  RAISE NOTICE 'Testing with tenant from email: % (email: %)', test_tenant, test_email;
  
  -- Test scenario 4: fallback to default
  test_tenant := NULL;
  IF test_tenant IS NULL OR test_tenant = '' THEN
    test_tenant := 'hoodti';
  END IF;
  RAISE NOTICE 'Testing with fallback tenant: %', test_tenant;
END $$;

-- 4. Check current profiles to see tenant distribution
SELECT 
  tenant_id,
  COUNT(*) as profile_count
FROM profiles 
GROUP BY tenant_id 
ORDER BY profile_count DESC;

-- 5. Test the fix_profile_tenant function
-- Replace with actual user ID and correct tenant
-- SELECT fix_profile_tenant('00000000-0000-0000-0000-000000000000'::UUID, 'correct-tenant-id');

-- 6. Show the trigger function definition
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user'; 