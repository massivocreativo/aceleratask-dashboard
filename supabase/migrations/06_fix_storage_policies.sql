-- =====================================================
-- FIX STORAGE POLICIES (Run this in SQL Editor)
-- =====================================================

-- 1. Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- 3. Create the Policies (Permissions)

-- A. Allow everyone to SEE the images (Public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'parrilla-images');

-- B. Allow any logged-in user to UPLOAD (Insert)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'parrilla-images');

-- C. Allow users to UPDATE their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'parrilla-images' AND owner = auth.uid());

-- D. Allow users to DELETE their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'parrilla-images' AND owner = auth.uid());
