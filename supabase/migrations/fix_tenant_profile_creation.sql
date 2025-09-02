-- FIX TENANT PROFILE CREATION
-- This fixes the issue where profiles are always created with 'hoodti' tenant

-- 1. First, let's temporarily disable RLS to test
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 3. Create a new function that uses tenant context
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  tenant_id TEXT;
BEGIN
  -- Try to get tenant_id from user metadata first
  tenant_id := new.raw_user_meta_data->>'tenant_id';
  
  -- If not found in metadata, try to get from session context
  IF tenant_id IS NULL THEN
    tenant_id := current_setting('app.tenant_id', true);
  END IF;
  
  -- Fallback to default tenant if still not found
  IF tenant_id IS NULL THEN
    tenant_id := 'hoodti';
  END IF;
  
  -- Insert profile with the determined tenant_id
  INSERT INTO public.profiles (id, email, tenant_id, created_at, updated_at)
  VALUES (new.id, new.email, tenant_id, NOW(), NOW())
  ON CONFLICT (id, tenant_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Create a function to set tenant context before profile operations
CREATE OR REPLACE FUNCTION set_tenant_context_for_profile(tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Set the tenant_id in the session
  PERFORM set_config('app.tenant_id', tenant_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute permission
GRANT EXECUTE ON FUNCTION set_tenant_context_for_profile(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_tenant_context_for_profile(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION set_tenant_context_for_profile(TEXT) TO service_role;

-- 7. Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 8. Update RLS policies to be more permissive for profile creation
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can do everything" ON public.profiles;

-- Allow authenticated users to insert their own profiles
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow service role to do everything (for admin functions)
CREATE POLICY "Service role can do everything"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 9. Create a function to manually create profiles with tenant context
CREATE OR REPLACE FUNCTION create_profile_with_tenant(
  p_user_id UUID,
  p_tenant_id TEXT,
  p_email TEXT,
  p_name TEXT DEFAULT NULL
) RETURNS profiles AS $$
DECLARE
  existing_profile profiles;
  new_profile profiles;
BEGIN
  -- Set tenant context
  PERFORM set_tenant_context_for_profile(p_tenant_id);
  
  -- Check if profile already exists
  SELECT * INTO existing_profile 
  FROM profiles 
  WHERE id = p_user_id AND tenant_id = p_tenant_id;
  
  -- If profile exists, return it
  IF existing_profile IS NOT NULL THEN
    RETURN existing_profile;
  END IF;
  
  -- Create new profile
  INSERT INTO profiles (id, email, name, tenant_id, created_at, updated_at)
  VALUES (p_user_id, p_email, p_name, p_tenant_id, NOW(), NOW())
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and return NULL
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant execute permission to the new function
GRANT EXECUTE ON FUNCTION create_profile_with_tenant(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile_with_tenant(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_profile_with_tenant(UUID, TEXT, TEXT, TEXT) TO service_role;

-- 11. Clean up old function
DROP FUNCTION IF EXISTS create_profile_if_not_exists(UUID, TEXT, TEXT, TEXT); 