-- =====================================================
-- ENABLE REALTIME FOR CONTENT
-- =====================================================

-- Add 'parrillas' and 'parrilla_comments' to the realtime publication.
-- This allows the frontend to listen for INSERT/UPDATE/DELETE events.

ALTER PUBLICATION supabase_realtime ADD TABLE parrillas;
ALTER PUBLICATION supabase_realtime ADD TABLE parrilla_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE parrilla_images;
ALTER PUBLICATION supabase_realtime ADD TABLE parrilla_assignees;
