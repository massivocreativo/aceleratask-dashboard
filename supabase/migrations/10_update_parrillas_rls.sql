-- =====================================================
-- UPDATE PARRILLAS RLS FOR ROLE-BASED VISIBILITY
-- =====================================================
-- Restrict SELECT access to parrillas.
-- Management roles (CEO, Creative Director, Content Manager) see ALL.
-- Designers see only assigned tasks or tasks they created.

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Parrillas viewable by authenticated" ON parrillas;

-- Create new restrictive policy
CREATE POLICY "Parrillas viewable by role and assignment"
  ON parrillas FOR SELECT
  TO authenticated
  USING (
    -- 1. Management roles can see ALL
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('CEO', 'Creative Director', 'Content Manager')
    )
    OR
    -- 2. Users can see tasks assigned to them
    EXISTS (
      SELECT 1 FROM parrilla_assignees
      WHERE parrilla_id = id 
      AND user_id = auth.uid()
    )
    OR
    -- 3. Users can see tasks they created
    created_by = auth.uid()
  );
