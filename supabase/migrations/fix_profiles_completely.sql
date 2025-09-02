-- COMPLETE FIX FOR PROFILES TABLE
-- This will fix all profile creation issues

-- 1. First, let's temporarily disable RLS to test
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;

-- 3. Drop the database function if it exists
DROP FUNCTION IF EXISTS create_profile_if_not_exists(UUID, TEXT, TEXT, TEXT);

-- 4. Create a simpler, more reliable database function
CREATE OR REPLACE FUNCTION create_profile_if_not_exists(
  p_user_id UUID,
  p_tenant_id TEXT,
  p_email TEXT,
  p_name TEXT DEFAULT NULL
) RETURNS profiles AS $$
DECLARE
  existing_profile profiles;
  new_profile profiles;
BEGIN
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

-- 5. Grant execute permission to everyone
GRANT EXECUTE ON FUNCTION create_profile_if_not_exists(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile_if_not_exists(UUID, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_profile_if_not_exists(UUID, TEXT, TEXT, TEXT) TO service_role;

-- 6. Create a trigger to automatically create profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, tenant_id, created_at, updated_at)
  VALUES (new.id, new.email, 'hoodti', NOW(), NOW())
  ON CONFLICT (id, tenant_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 8. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. Now re-enable RLS with simple policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. Create simple, permissive policies
-- Allow authenticated users to read their own profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow authenticated users to insert their own profiles
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profiles
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role to do everything (for admin functions)
CREATE POLICY "Service role can do everything"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true); 