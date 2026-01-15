-- =====================================================
-- ACELERATASK - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Execute this in Supabase SQL Editor
-- Project: xqwebtgzicdumqippdid
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILES TABLE
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Designer', 'Content Manager', 'Creative Director', 'CEO')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);

COMMENT ON TABLE user_profiles IS 'Extended user profiles with roles';
COMMENT ON COLUMN user_profiles.role IS 'User role: Designer, Content Manager, Creative Director, or CEO';

-- =====================================================
-- 2. CLIENTS TABLE
-- =====================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clients IS 'Marketing agency clients';

-- =====================================================
-- 3. STATUSES TABLE
-- =====================================================
CREATE TABLE statuses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial statuses
INSERT INTO statuses (id, name, color, icon, order_index) VALUES
  ('contenido', 'Contenido', '#3b82f6', 'FileText', 1),
  ('diseno', 'Diseño', '#f59e0b', 'Palette', 2),
  ('cambios', 'Cambios', '#f97316', 'AlertCircle', 3),
  ('entrega-final', 'Entrega Final', '#22c55e', 'CheckCircle', 4);

COMMENT ON TABLE statuses IS 'Parrilla workflow statuses';

-- =====================================================
-- 4. LABELS TABLE
-- =====================================================
CREATE TABLE labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial labels
INSERT INTO labels (id, name, color) VALUES
  ('post', 'Post', 'bg-blue-500'),
  ('story', 'Story', 'bg-purple-500'),
  ('reel', 'Reel', 'bg-pink-500'),
  ('carrusel', 'Carrusel', 'bg-green-500'),
  ('urgente', 'Urgente', 'bg-red-500'),
  ('instagram', 'Instagram', 'bg-gradient-to-r from-purple-500 to-pink-500'),
  ('facebook', 'Facebook', 'bg-blue-600'),
  ('tiktok', 'TikTok', 'bg-black');

COMMENT ON TABLE labels IS 'Content type labels for parrillas';

-- =====================================================
-- 5. PARRILLAS TABLE
-- =====================================================
CREATE TABLE parrillas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status_id TEXT NOT NULL REFERENCES statuses(id),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  due_date DATE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parrillas_status ON parrillas(status_id);
CREATE INDEX idx_parrillas_client ON parrillas(client_id);
CREATE INDEX idx_parrillas_due_date ON parrillas(due_date);
CREATE INDEX idx_parrillas_created_by ON parrillas(created_by);

COMMENT ON TABLE parrillas IS 'Content parrillas (grids) for social media';

-- =====================================================
-- 6. PARRILLA ASSIGNEES (Many-to-Many)
-- =====================================================
CREATE TABLE parrilla_assignees (
  parrilla_id UUID REFERENCES parrillas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (parrilla_id, user_id)
);

COMMENT ON TABLE parrilla_assignees IS 'Users assigned to parrillas';

-- =====================================================
-- 7. PARRILLA LABELS (Many-to-Many)
-- =====================================================
CREATE TABLE parrilla_labels (
  parrilla_id UUID REFERENCES parrillas(id) ON DELETE CASCADE,
  label_id TEXT REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (parrilla_id, label_id)
);

COMMENT ON TABLE parrilla_labels IS 'Labels assigned to parrillas';

-- =====================================================
-- 8. PARRILLA IMAGES
-- =====================================================
CREATE TABLE parrilla_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parrilla_id UUID NOT NULL REFERENCES parrillas(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parrilla_images_parrilla ON parrilla_images(parrilla_id);

COMMENT ON TABLE parrilla_images IS 'Images attached to parrillas';

-- =====================================================
-- 9. PARRILLA ANNOTATIONS
-- =====================================================
CREATE TABLE parrilla_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID NOT NULL REFERENCES parrilla_images(id) ON DELETE CASCADE,
  data_url TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE parrilla_annotations IS 'Drawing annotations on images';

-- =====================================================
-- 10. PARRILLA COMMENTS
-- =====================================================
CREATE TABLE parrilla_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parrilla_id UUID NOT NULL REFERENCES parrillas(id) ON DELETE CASCADE,
  image_id UUID REFERENCES parrilla_images(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_parrilla ON parrilla_comments(parrilla_id);
CREATE INDEX idx_comments_created_at ON parrilla_comments(created_at DESC);

COMMENT ON TABLE parrilla_comments IS 'Comments on parrillas and images';

-- =====================================================
-- TRIGGER: Auto-create user profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Designer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION handle_new_user IS 'Automatically creates user profile when new user signs up';

-- =====================================================
-- FUNCTION: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parrillas_updated_at BEFORE UPDATE ON parrillas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETED: Initial schema created
-- =====================================================
-- Next step: Run the RLS policies migration (02_rls_policies.sql)
