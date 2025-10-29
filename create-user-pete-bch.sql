-- ============================================
-- CREATE USER: Pete Bch
-- ============================================
-- Run this in your Supabase SQL Editor
-- This creates a regular user (not admin) named "Pete Bch"

-- Note: Password is "PeteBch123" (you can change it)
-- The password hash below is for "PeteBch123" using bcrypt
-- You can also use an online bcrypt generator to create a new hash if needed

INSERT INTO users (
  name,
  username,
  email,
  password_hash,
  role,
  avatar,
  followers,
  following,
  reputation,
  poll_count,
  win_rate,
  join_date,
  created_at,
  updated_at
) VALUES (
  'Pete Bch',
  '@petebch',
  'petebch@pollz.app',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Password: PeteBch123 (same as admin for testing, change if needed)
  'user', -- Regular user, not admin
  'https://ui-avatars.com/api/?name=Pete+Bch&background=667eea&color=ffffff&size=150',
  0,
  0,
  0,
  0,
  0,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  avatar = EXCLUDED.avatar,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the user was created
SELECT 
  id,
  name,
  username,
  email,
  role,
  avatar,
  created_at
FROM users
WHERE email = 'petebch@pollz.app';

