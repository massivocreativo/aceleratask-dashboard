-- =====================================================
-- FIX RLS INFINITE RECURSION
-- =====================================================
-- The previous policy "Users can manage assignees" was "FOR ALL", which includes SELECT.
-- This caused a recursion cycle: 
-- parrillas (SELECT) -> checks parrilla_assignees -> checks parrillas (via Manage policy) -> loop.
--
-- FIX: Restrict the Manage policy to INSERT, UPDATE, DELETE only.
-- SELECT is already covered by "Assignees viewable by authenticated".

-- 1. Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can manage assignees" ON parrilla_assignees;

-- 2. Re-create it for write operations only (INSERT, UPDATE, DELETE)
-- Exclude SELECT to break the cycle.
CREATE POLICY "Users can manage assignees"
  ON parrilla_assignees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parrillas
      WHERE id = parrilla_id
      AND (
        created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid()
          AND role IN ('CEO', 'Creative Director', 'Content Manager')
        )
      )
    )
  );

CREATE POLICY "Users can update assignees"
  ON parrilla_assignees FOR UPDATE
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
          AND role IN ('CEO', 'Creative Director', 'Content Manager')
        )
      )
    )
  );

CREATE POLICY "Users can delete assignees"
  ON parrilla_assignees FOR DELETE
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
          AND role IN ('CEO', 'Creative Director', 'Content Manager')
        )
      )
    )
  );
