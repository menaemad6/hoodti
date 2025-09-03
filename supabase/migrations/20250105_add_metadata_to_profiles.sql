-- Add metadata column to profiles table for storing points and other user data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add comment to the new column
COMMENT ON COLUMN public.profiles.metadata IS 'JSONB column for storing user metadata including points, redeemedPoints, and other future data';

-- Create index for metadata queries (optional, for performance)
CREATE INDEX IF NOT EXISTS profiles_metadata_idx ON public.profiles USING GIN (metadata);

-- Update existing profiles to have empty metadata object
UPDATE public.profiles 
SET metadata = '{}' 
WHERE metadata IS NULL;
