-- FIX GOOGLE OAUTH TENANT ISSUE
-- This specifically fixes the Google OAuth tenant context problem

-- 1. Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. Create an improved function that handles Google OAuth better
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  tenant_id TEXT;
  is_google_oauth BOOLEAN;
BEGIN
  -- Check if this is a Google OAuth sign-in
  is_google_oauth := (new.raw_app_meta_data->>'provider') = 'google';
  
  -- Try to get tenant_id from user metadata first
  tenant_id := new.raw_user_meta_data->>'tenant_id';
  
  -- If not found in metadata, try to get from session context
  IF tenant_id IS NULL THEN
    tenant_id := current_setting('app.tenant_id', true);
  END IF;
  
  -- For Google OAuth, if we still don't have tenant, try to extract from email
  IF tenant_id IS NULL AND is_google_oauth THEN
    -- Check if email contains tenant info (e.g., user+tenant@domain.com)
    IF new.email LIKE '%+%' THEN
      tenant_id := split_part(split_part(new.email, '+', 2), '@', 1);
    END IF;
  END IF;
  
  -- If still not found, check if there's a tenant in the user's app_metadata
  IF tenant_id IS NULL THEN
    tenant_id := new.raw_app_meta_data->>'tenant_id';
  END IF;
  
  -- Last resort: check if there's a tenant in the user's raw_user_meta_data
  IF tenant_id IS NULL THEN
    tenant_id := new.raw_user_meta_data->>'tenant_id';
  END IF;
  
  -- For Google OAuth, if we still don't have tenant, delay profile creation
  -- The callback will handle it properly
  IF tenant_id IS NULL OR tenant_id = '' THEN
    IF is_google_oauth THEN
      RAISE NOTICE 'Google OAuth user % created without tenant context - profile will be created in callback', new.id;
      RETURN new;
    ELSE
      tenant_id := 'hoodti';
    END IF;
  END IF;
  
  -- Log what we're doing for debugging
  RAISE NOTICE 'Creating profile for user % with tenant: % (email: %, is_google: %)', new.id, tenant_id, new.email, is_google_oauth;
  
  -- Insert profile with the determined tenant_id
  -- Use a simple INSERT with exception handling instead of ON CONFLICT
  BEGIN
    INSERT INTO public.profiles (id, email, tenant_id, created_at, updated_at)
    VALUES (new.id, new.email, tenant_id, NOW(), NOW());
    RAISE NOTICE 'Successfully created profile for user % with tenant %', new.id, tenant_id;
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, ignore the error
      RAISE NOTICE 'Profile already exists for user % with tenant %', new.id, tenant_id;
    WHEN OTHERS THEN
      -- Log other errors but don't fail the user creation
      RAISE NOTICE 'Error creating profile for user %: %', new.id, SQLERRM;
  END;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Create a function to fix Google OAuth profiles specifically
CREATE OR REPLACE FUNCTION fix_google_oauth_profile(
  p_user_id UUID,
  p_correct_tenant_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  existing_profile profiles;
  deleted_count INTEGER;
BEGIN
  -- Check if profile exists
  SELECT * INTO existing_profile 
  FROM profiles 
  WHERE id = p_user_id;
  
  IF existing_profile IS NULL THEN
    RAISE NOTICE 'No profile found for user %', p_user_id;
    RETURN FALSE;
  END IF;
  
  -- If profile has wrong tenant, delete it and let the callback recreate it
  IF existing_profile.tenant_id != p_correct_tenant_id THEN
    RAISE NOTICE 'Found Google OAuth profile with wrong tenant: % (should be: %)', existing_profile.tenant_id, p_correct_tenant_id;
    
    -- Delete the wrong profile
    DELETE FROM profiles 
    WHERE id = p_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
      RAISE NOTICE 'Deleted profile with wrong tenant for user %', p_user_id;
      RETURN TRUE;
    ELSE
      RAISE NOTICE 'Failed to delete profile for user %', p_user_id;
      RETURN FALSE;
    END IF;
  ELSE
    RAISE NOTICE 'Profile for user % already has correct tenant %', p_user_id, p_correct_tenant_id;
    RETURN TRUE;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing Google OAuth profile: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Grant execute permission
GRANT EXECUTE ON FUNCTION fix_google_oauth_profile(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION fix_google_oauth_profile(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION fix_google_oauth_profile(UUID, TEXT) TO service_role;

-- 6. Create a function to check and fix all Google OAuth profiles
CREATE OR REPLACE FUNCTION check_google_oauth_profiles()
RETURNS TABLE(user_id UUID, email TEXT, current_tenant TEXT, should_be_tenant TEXT) AS $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT 
      p.id,
      p.email,
      p.tenant_id,
      u.raw_user_meta_data->>'tenant_id' as expected_tenant
    FROM profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE u.raw_app_meta_data->>'provider' = 'google'
    AND p.tenant_id != COALESCE(u.raw_user_meta_data->>'tenant_id', 'hoodti')
  LOOP
    user_id := profile_record.id;
    email := profile_record.email;
    current_tenant := profile_record.tenant_id;
    should_be_tenant := COALESCE(profile_record.expected_tenant, 'hoodti');
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant execute permission
GRANT EXECUTE ON FUNCTION check_google_oauth_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION check_google_oauth_profiles() TO service_role; 