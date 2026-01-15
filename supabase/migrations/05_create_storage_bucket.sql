-- =====================================================
-- STORAGE BUCKET CREATION
-- =====================================================

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('parrilla-images', 'parrilla-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (just in case)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STORAGE RLS POLICIES
-- =====================================================

-- Allow Public Access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'parrilla-images');

-- Allow Authenticated Users to Upload Images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'parrilla-images'
);

-- Allow Users to Update their own images (or if they are managers)
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'parrilla-images' 
  AND (auth.uid() = owner OR 
       EXISTS (
         SELECT 1 FROM user_profiles
         WHERE id = auth.uid()
         AND role IN ('CEO', 'Creative Director')
       ))
);

-- Allow Users to Delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'parrilla-images'
  AND (auth.uid() = owner OR 
       EXISTS (
         SELECT 1 FROM user_profiles
         WHERE id = auth.uid()
         AND role IN ('CEO', 'Creative Director')
       ))
);
