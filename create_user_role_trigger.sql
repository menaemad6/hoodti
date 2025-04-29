-- Create a trigger function to automatically add a default user role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a row into public.user_roles with default "user" role
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (
    NEW.id,
    'user',
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_role_created ON auth.users;
CREATE TRIGGER on_auth_user_role_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- Fix any existing users that don't have roles
DO $$
DECLARE
  missing_role_users RECORD;
BEGIN
  FOR missing_role_users IN 
    SELECT id, created_at
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id
    )
  LOOP
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (
      missing_role_users.id,
      'user',
      missing_role_users.created_at
    );
  END LOOP;
END
$$ LANGUAGE plpgsql; 