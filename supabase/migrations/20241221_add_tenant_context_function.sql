-- Create function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Set the tenant_id in the session
  PERFORM set_config('app.tenant_id', tenant_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_tenant_context(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_tenant_context(TEXT) TO anon; 