-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment to table
COMMENT ON TABLE public.profiles IS 'User profile information';

-- Add comments to columns
COMMENT ON COLUMN public.profiles.id IS 'References the auth.users id';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.name IS 'User full name';
COMMENT ON COLUMN public.profiles.avatar IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.phone_number IS 'User phone number';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp when the profile was created';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp when the profile was last updated';

-- Create indices for performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
CREATE INDEX IF NOT EXISTS profiles_name_idx ON public.profiles (name);

-- Add check constraint for phone number format (starts with 01 and has 11 digits)
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_phone_number_check;
  
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_phone_number_check 
  CHECK (
    phone_number IS NULL OR 
    phone_number ~ '^01[0-9]{9}$'
  ); 