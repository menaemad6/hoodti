-- Create a trigger function to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Make sure the profiles table exists first (extra safety)
  EXECUTE '
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      name TEXT,
      avatar TEXT,
      phone_number TEXT,
      tenant_id TEXT DEFAULT ''hoodti'',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  ';

  -- Insert a row into public.profiles for the new user
  -- Using ON CONFLICT DO NOTHING to make it idempotent
  INSERT INTO public.profiles (id, email, name, tenant_id, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'tenant_id', 'hoodti'),
    COALESCE(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent the user from being created
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Fix any existing users that don't have profiles
DO $$
DECLARE
  missing_users RECORD;
  fixed_count INT := 0;
BEGIN
  FOR missing_users IN 
    SELECT id, email, created_at, raw_user_meta_data->>'name' as name
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = u.id
    )
  LOOP
    BEGIN
      INSERT INTO public.profiles (id, email, name, tenant_id, created_at, updated_at)
      VALUES (
        missing_users.id,
        missing_users.email,
        missing_users.name,
        'hoodti',
        COALESCE(missing_users.created_at, now()),
        now()
      );
      fixed_count := fixed_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error fixing profile for user %: %', missing_users.id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Fixed % missing profiles', fixed_count;
END
$$ LANGUAGE plpgsql; 