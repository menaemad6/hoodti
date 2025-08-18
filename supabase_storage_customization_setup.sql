-- Storage bucket setup for customization feature
-- This file should be run after setting up Supabase storage

-- Create customization-uploads bucket for temporary user uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customization-uploads',
  'customization-uploads',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create customization-designs bucket for final designs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customization-designs',
  'customization-designs',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for customization-uploads bucket
-- Users can upload to their own folder
CREATE POLICY "Users can upload customization images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'customization-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own uploads
CREATE POLICY "Users can view own customization uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'customization-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own uploads
CREATE POLICY "Users can update own customization uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'customization-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own uploads
CREATE POLICY "Users can delete own customization uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'customization-uploads' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS policies for customization-designs bucket
-- Public read access for final designs
CREATE POLICY "Public read access to customization designs" ON storage.objects
  FOR SELECT USING (bucket_id = 'customization-designs');

-- Only authenticated users can upload final designs
CREATE POLICY "Authenticated users can upload final designs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'customization-designs' AND
    auth.role() = 'authenticated'
  );

-- Only authenticated users can update final designs
CREATE POLICY "Authenticated users can update final designs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'customization-designs' AND
    auth.role() = 'authenticated'
  );

-- Only authenticated users can delete final designs
CREATE POLICY "Authenticated users can delete final designs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'customization-designs' AND
    auth.role() = 'authenticated'
  );

-- Function to get signed URL for customization uploads
CREATE OR REPLACE FUNCTION get_customization_upload_url(
  file_path TEXT,
  expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
BEGIN
  RETURN storage.sign_url(
    'customization-uploads',
    file_path,
    expires_in,
    'PUT'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get signed URL for customization design downloads
CREATE OR REPLACE FUNCTION get_customization_design_url(
  file_path TEXT,
  expires_in INTEGER DEFAULT 86400
)
RETURNS TEXT AS $$
BEGIN
  RETURN storage.sign_url(
    'customization-designs',
    file_path,
    expires_in,
    'GET'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_customization_upload_url(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customization_design_url(TEXT, INTEGER) TO authenticated;

-- Create cleanup function for abandoned uploads (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_abandoned_customization_uploads()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'customization-uploads' 
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to run cleanup every hour (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-customization-uploads', '0 * * * *', 'SELECT cleanup_abandoned_customization_uploads();');

-- Note: The cron job above requires the pg_cron extension to be enabled
-- If pg_cron is not available, you can run the cleanup function manually
-- or implement it in your application logic
