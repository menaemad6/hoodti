-- EMERGENCY FIX FOR SIGNUP
-- This temporarily disables the trigger to allow signups to work

-- 1. Disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create a minimal trigger that just logs and doesn't fail
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Just log the user creation and don't try to create profile
  -- This prevents the signup from failing
  RAISE NOTICE 'User created: % with email: %', new.id, new.email;
  
  -- Don't try to create profile here - let the frontend handle it
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Ensure RLS is properly configured for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create permissive policies for profile creation
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

-- 6. Create a simple profile creation function
CREATE OR REPLACE FUNCTION create_simple_profile(
  p_user_id UUID,
  p_tenant_id TEXT,
  p_email TEXT
) RETURNS profiles AS $$
DECLARE
  new_profile profiles;
BEGIN
  -- Simple insert without complex logic
  INSERT INTO profiles (id, email, tenant_id, created_at, updated_at)
  VALUES (p_user_id, p_email, p_tenant_id, NOW(), NOW())
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION create_simple_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_simple_profile(UUID, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_simple_profile(UUID, TEXT, TEXT) TO service_role; 