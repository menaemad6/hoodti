-- Create a database function to handle profile creation more reliably
CREATE OR REPLACE FUNCTION create_profile_if_not_exists(
  p_user_id UUID,
  p_tenant_id TEXT,
  p_email TEXT,
  p_name TEXT DEFAULT NULL
) RETURNS profiles AS $$
DECLARE
  existing_profile profiles;
  new_profile profiles;
BEGIN
  -- Check if profile already exists
  SELECT * INTO existing_profile 
  FROM profiles 
  WHERE id = p_user_id AND tenant_id = p_tenant_id;
  
  -- If profile exists, return it
  IF existing_profile IS NOT NULL THEN
    RETURN existing_profile;
  END IF;
  
  -- Create new profile
  INSERT INTO profiles (id, email, name, tenant_id, created_at, updated_at)
  VALUES (p_user_id, p_email, p_name, p_tenant_id, NOW(), NOW())
  RETURNING * INTO new_profile;
  
  RETURN new_profile;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and return NULL
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_profile_if_not_exists(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile_if_not_exists(UUID, TEXT, TEXT, TEXT) TO anon; 