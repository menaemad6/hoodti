-- FIX EXISTING PROFILES WITH WRONG TENANT
-- This script helps fix profiles that were created with the wrong tenant_id

-- 1. Show current profile distribution
SELECT 
  tenant_id,
  COUNT(*) as profile_count
FROM profiles 
GROUP BY tenant_id 
ORDER BY profile_count DESC;

-- 2. Show profiles that might need fixing (example: all profiles with 'hoodti' tenant)
SELECT 
  id,
  email,
  tenant_id,
  created_at
FROM profiles 
WHERE tenant_id = 'hoodti'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Function to fix a specific user's profile tenant
-- Usage: SELECT fix_profile_tenant('user-uuid-here', 'correct-tenant-id');

-- 4. Example: Fix profiles for users who signed up with Google OAuth
-- This would need to be run for each user individually
-- SELECT fix_profile_tenant('00000000-0000-0000-0000-000000000000'::UUID, 'correct-tenant-id');

-- 5. Check if there are any duplicate profiles for the same user
SELECT 
  id,
  COUNT(*) as profile_count,
  array_agg(tenant_id) as tenants
FROM profiles 
GROUP BY id 
HAVING COUNT(*) > 1
ORDER BY profile_count DESC;

-- 6. Function to clean up duplicate profiles (keep the most recent one)
CREATE OR REPLACE FUNCTION cleanup_duplicate_profiles()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT 
      p1.id,
      p1.tenant_id,
      p1.created_at,
      ROW_NUMBER() OVER (PARTITION BY p1.id ORDER BY p1.created_at DESC) as rn
    FROM profiles p1
    WHERE EXISTS (
      SELECT 1 FROM profiles p2 
      WHERE p2.id = p1.id 
      GROUP BY p2.id 
      HAVING COUNT(*) > 1
    )
  LOOP
    IF profile_record.rn > 1 THEN
      DELETE FROM profiles 
      WHERE id = profile_record.id 
      AND tenant_id = profile_record.tenant_id 
      AND created_at = profile_record.created_at;
      
      deleted_count := deleted_count + 1;
      RAISE NOTICE 'Deleted duplicate profile for user % with tenant %', profile_record.id, profile_record.tenant_id;
    END IF;
  END LOOP;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permission to run cleanup
GRANT EXECUTE ON FUNCTION cleanup_duplicate_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_duplicate_profiles() TO service_role;

-- 8. Show the cleanup function (run manually if needed)
-- SELECT cleanup_duplicate_profiles(); 