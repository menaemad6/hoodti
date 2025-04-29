-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = has_role.user_id
    AND user_roles.role = has_role.role
  );
END;
$$;

-- Function to get the highest role for a user
-- Returns: super_admin > admin > user
CREATE OR REPLACE FUNCTION public.get_highest_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  role_result TEXT;
BEGIN
  -- Check for super_admin first
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = get_highest_role.user_id
    AND role = 'super_admin'
  ) THEN
    RETURN 'super_admin';
  END IF;
  
  -- Check for admin second
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = get_highest_role.user_id
    AND role = 'admin'
  ) THEN
    RETURN 'admin';
  END IF;
  
  -- Check for user third
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = get_highest_role.user_id
    AND role = 'user'
  ) THEN
    RETURN 'user';
  END IF;
  
  -- If no role is found, raise an exception
  RAISE EXCEPTION 'No role found for user %', user_id;
END;
$$; 