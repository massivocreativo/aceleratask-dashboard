-- Add attachment_url to parrilla_comments to store the edited image
ALTER TABLE parrilla_comments 
ADD COLUMN attachment_url TEXT;

COMMENT ON COLUMN parrilla_comments.attachment_url IS 'URL of the annotated/edited image attached to this comment';
