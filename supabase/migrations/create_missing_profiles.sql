-- This script can be run manually to create profiles for any users that don't have them
-- It's a more direct approach than the trigger for immediate fixing

-- First, make sure the profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fix any existing users that don't have profiles by inserting records directly
INSERT INTO public.profiles (id, email, name, created_at, updated_at)
SELECT 
  u.id, 
  u.email, 
  u.raw_user_meta_data->>'name',
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Output the count of newly created profiles
DO $$
DECLARE
  profile_count INT;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  RAISE NOTICE 'Total profiles after update: %', profile_count;
END $$; 