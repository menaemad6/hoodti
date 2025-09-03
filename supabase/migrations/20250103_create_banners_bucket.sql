-- Create banners storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Anyone can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete banner images" ON storage.objects;

-- Create storage policies for banners bucket
CREATE POLICY "Anyone can view banner images" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload banner images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can update banner images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can delete banner images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated'
  );
