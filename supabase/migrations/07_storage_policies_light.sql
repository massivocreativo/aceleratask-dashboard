-- =====================================================
-- LIGHTWEIGHT STORAGE POLICIES
-- =====================================================
-- Si el anterior falló por permisos de "ALTER TABLE" o "DROP POLICY",
-- este solo intenta CREAR las reglas nuevas.

-- 1. Public Access (Ver imágenes)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'parrilla-images');

-- 2. Upload (Subir imágenes)
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'parrilla-images');

-- 3. Update (Editar imágenes propias)
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'parrilla-images' AND owner = auth.uid());

-- 4. Delete (Borrar imágenes propias)
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'parrilla-images' AND owner = auth.uid());
