-- =====================================================
-- AUTO CLEANUP OF OLD ATTACHMENTS
-- =====================================================

-- Function to clear the attachment_url from comments older than 5 days
-- Note: This removes the reference from the application UI.
-- For physical storage cleanup, users on Pro plan can use Storage Lifecycle Policies.
-- Alternatively, an Edge Function + pg_cron is required for deleting objects via API.

CREATE OR REPLACE FUNCTION delete_old_attachments()
RETURNS void AS $$
BEGIN
  UPDATE parrilla_comments
  SET attachment_url = NULL
  WHERE attachment_url IS NOT NULL
    AND created_at < NOW() - INTERVAL '5 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION delete_old_attachments IS 'Nullifies attachment_url for comments older than 5 days';

-- If pg_cron is available (Supabase Cloud), schedule it daily
-- SELECT cron.schedule('0 0 * * *', 'SELECT delete_old_attachments()');
