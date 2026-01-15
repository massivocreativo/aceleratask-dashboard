-- =====================================================
-- ACELERATASK - ROW LEVEL SECURITY POLICIES
-- =====================================================
-- Execute this AFTER 01_initial_schema.sql
-- =====================================================

-- =====================================================
-- USER PROFILES RLS
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view all profiles (needed for assignment)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- =====================================================
-- CLIENTS RLS
-- =====================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view clients
CREATE POLICY "Clients viewable by authenticated"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

-- CEO and Creative Director can create clients
CREATE POLICY "Managers can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('CEO', 'Creative Director')
    )
  );

-- CEO and Creative Director can update/delete clients
CREATE POLICY "Managers can manage clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('CEO', 'Creative Director')
    )
  );

CREATE POLICY "Managers can delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('CEO', 'Creative Director')
    )
  );

-- =====================================================
-- STATUSES RLS (Read-only for all)
-- =====================================================
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Statuses viewable by authenticated"
  ON statuses FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- LABELS RLS (Read-only for all)
-- =====================================================
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labels viewable by authenticated"
  ON labels FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- PARRILLAS RLS
-- =====================================================
ALTER TABLE parrillas ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view parrillas
CREATE POLICY "Parrillas viewable by authenticated"
  ON parrillas FOR SELECT
  TO authenticated
  USING (true);

-- All authenticated users can create parrillas
CREATE POLICY "Users can create parrillas"
  ON parrillas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Assigned users and managers can update parrillas
CREATE POLICY "Assigned users and managers can update parrillas"
  ON parrillas FOR UPDATE
  TO authenticated
  USING (
    -- User is assigned to this parrilla
    EXISTS (
      SELECT 1 FROM parrilla_assignees
      WHERE parrilla_id = id AND user_id = auth.uid()
    )
    OR
    -- User is CEO or Creative Director
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('CEO', 'Creative Director')
    )
    OR
    -- User created this parrilla
    created_by = auth.uid()
  );

-- Only managers can delete parrillas
CREATE POLICY "Managers can delete parrillas"
  ON parrillas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('CEO', 'Creative Director')
    )
  );

-- =====================================================
-- PARRILLA ASSIGNEES RLS
-- =====================================================
ALTER TABLE parrilla_assignees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignees viewable by authenticated"
  ON parrilla_assignees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage assignees"
  ON parrilla_assignees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parrillas
      WHERE id = parrilla_id
      AND (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid()
          AND role IN ('CEO', 'Creative Director')
        )
      )
    )
  );

-- =====================================================
-- PARRILLA LABELS RLS
-- =====================================================
ALTER TABLE parrilla_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labels viewable by authenticated"
  ON parrilla_labels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage parrilla labels"
  ON parrilla_labels FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parrillas
      WHERE id = parrilla_id
      AND (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM parrilla_assignees
          WHERE parrilla_id = parrillas.id AND user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid()
          AND role IN ('CEO', 'Creative Director')
        )
      )
    )
  );

-- =====================================================
-- PARRILLA IMAGES RLS
-- =====================================================
ALTER TABLE parrilla_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Images viewable by authenticated"
  ON parrilla_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Assigned users can manage images"
  ON parrilla_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parrillas
      WHERE id = parrilla_id
      AND (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM parrilla_assignees
          WHERE parrilla_id = parrillas.id AND user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid()
          AND role IN ('CEO', 'Creative Director')
        )
      )
    )
  );

-- =====================================================
-- PARRILLA ANNOTATIONS RLS
-- =====================================================
ALTER TABLE parrilla_annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Annotations viewable by authenticated"
  ON parrilla_annotations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create annotations"
  ON parrilla_annotations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own annotations"
  ON parrilla_annotations FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- =====================================================
-- PARRILLA COMMENTS RLS
-- =====================================================
ALTER TABLE parrilla_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by authenticated"
  ON parrilla_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create comments"
  ON parrilla_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own comments"
  ON parrilla_comments FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON parrilla_comments FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- =====================================================
-- COMPLETED: RLS Policies configured
-- =====================================================
-- All tables now have appropriate Row Level Security
-- Next step: Configure Supabase client in the app
