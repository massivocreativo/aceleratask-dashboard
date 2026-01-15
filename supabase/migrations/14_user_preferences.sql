-- =====================================================
-- ADD USER PREFERENCES
-- =====================================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": {"all": true, "email": false}}'::jsonb;

-- Allow users to update their own preferences
-- Existing RLS "Users can update own profile" likely covers this if it allows UPDATE on the table.
-- Let's verify RLS policies in 02_rls_policies.sql.
-- "Users can update own profile" USING (auth.uid() = id) -> This allows updating ALL columns usually.
-- Ideally we restrict it, but for now this is fine.
