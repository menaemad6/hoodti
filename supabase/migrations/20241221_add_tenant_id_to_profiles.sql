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