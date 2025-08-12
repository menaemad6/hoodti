-- Ensure profile name is saved on signup and backfill missing names

-- 1) Recreate trigger function to include name and correct tenant detection
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_tenant_id TEXT;
  v_name TEXT;
BEGIN
  -- Prefer metadata tenant_id, then session setting, then default
  v_tenant_id := NEW.raw_user_meta_data->>'tenant_id';
  IF v_tenant_id IS NULL THEN
    v_tenant_id := current_setting('app.tenant_id', true);
  END IF;
  IF v_tenant_id IS NULL THEN
    v_tenant_id := 'hoodti';
  END IF;

  -- Extract name from metadata if present
  v_name := NEW.raw_user_meta_data->>'name';

  -- Insert profile including name
  INSERT INTO public.profiles (id, email, name, tenant_id, created_at, updated_at)
  VALUES (NEW.id, NEW.email, v_name, v_tenant_id, COALESCE(NEW.created_at, now()), now())
  ON CONFLICT (id, tenant_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) Ensure trigger is present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3) Backfill missing names from auth.users metadata
UPDATE public.profiles p
SET name = u.raw_user_meta_data->>'name',
    updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND p.name IS NULL
  AND (u.raw_user_meta_data->>'name') IS NOT NULL;


