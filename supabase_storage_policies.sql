-- First, check if the products bucket exists, if not create it
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('products', 'products', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Delete any existing policies for the products bucket to avoid conflicts
DROP POLICY IF EXISTS "Public Access for Products Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated to Upload Products Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated to Update Products Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated to Delete Products Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Operations on Products Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone Can View Products Images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone Can Upload Products Images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone Can Update Products Images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone Can Delete Products Images" ON storage.objects;

-- SUPER PERMISSIVE POLICY FOR DEVELOPMENT
-- WARNING: Only use this for development, not for production!
CREATE POLICY "Development: Allow Everything"
ON storage.objects
USING (true)  -- Allows all operations for all buckets 
WITH CHECK (true);  -- Allows all operations for all buckets

-- Make the products bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'products';

-- Explicitly disable RLS for development (USE WITH CAUTION)
-- Comment this out for production!
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- For security, you should switch to these more restrictive policies in production
/*
-- Proper product-specific policies for production
CREATE POLICY "Allow Public View Products Bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

CREATE POLICY "Allow Authenticated Upload to Products Bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow Authenticated Update Products Bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow Authenticated Delete from Products Bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
*/ 