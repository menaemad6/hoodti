-- TEST TENANT PROFILE FIX
-- This script tests the tenant profile creation fix

-- 1. Test the tenant context function
SELECT set_tenant_context_for_profile('test-tenant');

-- 2. Check if the context was set
SELECT current_setting('app.tenant_id', true) as current_tenant;

-- 3. Test the profile creation function
-- Note: Replace with actual user ID for testing
-- SELECT create_profile_with_tenant(
--   '00000000-0000-0000-0000-000000000000'::UUID,
--   'test-tenant',
--   'test@example.com',
--   'Test User'
-- );

-- 4. Check existing profiles to see tenant distribution
SELECT 
  tenant_id,
  COUNT(*) as profile_count
FROM profiles 
GROUP BY tenant_id 
ORDER BY profile_count DESC;

-- 5. Check the trigger function logic
-- This shows what the trigger would do with different scenarios
SELECT 
  'hoodti' as fallback_tenant,
  'test-tenant' as metadata_tenant,
  'context-tenant' as context_tenant,
  CASE 
    WHEN 'test-tenant' IS NOT NULL THEN 'test-tenant'
    WHEN current_setting('app.tenant_id', true) IS NOT NULL THEN current_setting('app.tenant_id', true)
    ELSE 'hoodti'
  END as final_tenant; 