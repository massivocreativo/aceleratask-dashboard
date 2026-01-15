-- =====================================================
-- ACELERATASK - SEED DATA (Optional)
-- =====================================================
-- Execute this to populate initial test data
-- =====================================================

-- Insert sample clients
INSERT INTO clients (id, name, color, contact_email) VALUES
  (gen_random_uuid(), 'Nike', '#FF6B35', 'contact@nike.com'),
  (gen_random_uuid(), 'Adidas', '#004D98', 'contact@adidas.com'),
  (gen_random_uuid(), 'Puma', '#000000', 'contact@puma.com'),
  (gen_random_uuid(), 'Reebok', '#C8102E', 'contact@reebok.com')
ON CONFLICT DO NOTHING;

-- Note: Users and parrillas will be created through the app
-- This is just to have some clients available for testing
