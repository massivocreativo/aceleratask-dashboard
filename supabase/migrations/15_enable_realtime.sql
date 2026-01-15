-- =====================================================
-- ENABLE REALTIME FOR NOTIFICATIONS
-- =====================================================
-- By default, new tables are not added to the realtime publication.
-- We must explicitly add it to listen for changes on the client.

-- Check if publication exists (standard in Supabase) and add table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
