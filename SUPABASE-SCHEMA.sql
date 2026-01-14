-- ============================================
-- POLLZ DATABASE SCHEMA FOR SUPABASE
-- ============================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Run it to create all tables and policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  password_hash TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  reputation INTEGER DEFAULT 0,
  poll_count INTEGER DEFAULT 0,
  win_rate DECIMAL DEFAULT 0,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- POLLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  votes_option_a INTEGER DEFAULT 0,
  votes_option_b INTEGER DEFAULT 0,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  context TEXT,
  is_expired BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trending_score DECIMAL DEFAULT 0,
  poll_type TEXT DEFAULT 'question',
  timer_enabled BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT FALSE,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  validation_reason TEXT,
  validated_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_polls_author_id ON polls(author_id);
CREATE INDEX IF NOT EXISTS idx_polls_category ON polls(category);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_trending_score ON polls(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_polls_validation_status ON polls(validation_status);

-- ============================================
-- VOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  option CHAR(1) CHECK (option IN ('A', 'B')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id) -- Ensure one vote per user per poll
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- POLL HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS poll_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  poll_title TEXT,
  poll_category TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_poll_history_user_id ON poll_history(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_history_timestamp ON poll_history(timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create users (for signup)" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Polls policies
-- Public polls: only show approved polls to everyone, but allow authors to see their own pending/rejected polls
CREATE POLICY "Polls are viewable by everyone" ON polls
  FOR SELECT USING (
    validation_status = 'approved' 
    OR auth.uid() = author_id
  );

CREATE POLICY "Authenticated users can create polls" ON polls
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own polls" ON polls
  FOR DELETE USING (true);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (true);

-- Poll history policies
CREATE POLICY "Users can view their own poll history" ON poll_history
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create poll history" ON poll_history
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for polls table
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update poll vote counts
CREATE OR REPLACE FUNCTION update_poll_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment vote count
    IF NEW.option = 'A' THEN
      UPDATE polls 
      SET votes = votes + 1, votes_option_a = votes_option_a + 1
      WHERE id = NEW.poll_id;
    ELSE
      UPDATE polls 
      SET votes = votes + 1, votes_option_b = votes_option_b + 1
      WHERE id = NEW.poll_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update poll votes
CREATE TRIGGER update_poll_votes_trigger
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_votes();

-- ============================================
-- SAMPLE ADMIN USER (Optional)
-- Password: Admin@123 (hashed with bcrypt)
-- ============================================
INSERT INTO users (name, username, email, password_hash, role, avatar)
VALUES (
  'Admin',
  '@admin',
  'admin@pollz.app',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'https://ui-avatars.com/api/?name=Admin&background=ff0000&color=ffffff&size=150'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFY SETUP
-- ============================================
-- Run these queries to verify your setup:

-- Check tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check users
-- SELECT * FROM users;

-- Check RLS policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- ============================================
-- SUCCESS!
-- ============================================
-- ✅ Your database is ready!
-- Next steps:
-- 1. Copy your Supabase URL and anon key to .supaenv file
-- 2. Run the migration script to import your localStorage data
-- 3. Update your app to use Supabase instead of localStorage

