-- =====================================================
-- Migration: Update handle_new_user to capture Google avatar
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuario Nuevo'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Designer'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(
      EXCLUDED.avatar_url,
      user_profiles.avatar_url
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user IS 'Automatically creates user profile when new user signs up, including Google avatar';
