-- Create a storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for Storage
-- Note: Storage policies are on storage.objects, not the bucket itself

-- 1. Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

-- 2. Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery');

-- 3. Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');

-- 4. Allow public access to view images
CREATE POLICY "Allow public access to gallery images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');
