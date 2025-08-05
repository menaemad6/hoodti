-- Add tenant_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tenant_id TEXT DEFAULT 'hoodti';

-- Add index for tenant_id for better performance
CREATE INDEX IF NOT EXISTS profiles_tenant_id_idx ON public.profiles (tenant_id);

-- Add comment to the new column
COMMENT ON COLUMN public.profiles.tenant_id IS 'Tenant ID for multi-tenant user management';

-- Update existing profiles to have the default tenant_id
UPDATE public.profiles 
SET tenant_id = 'hoodti' 
WHERE tenant_id IS NULL;

-- Update the profile trigger function to include tenant_id
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