-- Fix profiles table to allow multiple profiles per user across tenants
-- Drop the existing primary key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Drop the unique constraint if it already exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_tenant_unique;

-- Add a composite primary key (id, tenant_id) to allow multiple profiles per user
ALTER TABLE public.profiles ADD PRIMARY KEY (id, tenant_id);

-- Add unique constraint on (id, tenant_id) to ensure no duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_tenant_unique UNIQUE (id, tenant_id);

-- Add comment explaining the new structure
COMMENT ON CONSTRAINT profiles_id_tenant_unique ON public.profiles IS 'Ensures one profile per user per tenant'; 