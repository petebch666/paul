-- ============================================
-- UPDATE EXISTING POLLS WITH USERNAME
-- ============================================
-- Run this in your Supabase SQL Editor
-- This updates all existing polls to have the admin username as the author

-- Update all polls to set author_username to '@admin' for existing polls
-- (Assuming admin user has username '@admin')
UPDATE polls 
SET author_username = '@admin'
WHERE author_username IS NULL 
  AND author_id IN (SELECT id FROM users WHERE username = '@admin' OR email = 'admin@pollz.app');

-- Alternative: Update based on author_id matching admin user
UPDATE polls p
SET author_username = u.username
FROM users u
WHERE p.author_id = u.id 
  AND p.author_username IS NULL;

-- Verify the updates
SELECT 
  id,
  title,
  author_name,
  author_username,
  created_at
FROM polls
WHERE author_username IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

