-- ============================================
-- MIGRATIONS: PHASE 2 + ENGAGEMENT FEATURES
-- ============================================
-- Run this file INSTEAD of SUPABASE-SCHEMA.sql if you already
-- have the base tables created (users, polls, votes, notifications,
-- poll_history). This file is safe to run on an existing database.
-- ============================================

-- ============================================
-- PHASE 2: USER STATUS MANAGEMENT
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status_changed_by UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ============================================
-- PHASE 2: DEATHMATCH COLUMNS ON POLLS
-- ============================================

ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_deathmatch BOOLEAN DEFAULT FALSE;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_shadow_deathmatch BOOLEAN DEFAULT FALSE;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS option_a_owner_id UUID REFERENCES users(id);
ALTER TABLE polls ADD COLUMN IF NOT EXISTS option_b_owner_id UUID REFERENCES users(id);
ALTER TABLE polls ADD COLUMN IF NOT EXISTS deathmatch_status TEXT DEFAULT 'accepted'
  CHECK (deathmatch_status IN ('pending', 'accepted', 'rejected'));
ALTER TABLE polls ADD COLUMN IF NOT EXISTS author_username TEXT;

CREATE INDEX IF NOT EXISTS idx_polls_is_deathmatch ON polls(is_deathmatch);
CREATE INDEX IF NOT EXISTS idx_polls_deathmatch_status ON polls(deathmatch_status);

-- ============================================
-- PHASE 2: ADMIN AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  admin_username TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'user_role_changed', 'user_suspended', 'user_banned', 'user_unsuspended',
    'poll_deleted', 'poll_approved', 'poll_rejected'
  )),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'poll')),
  details JSONB,
  reason TEXT,
  previous_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON admin_audit_log;
CREATE POLICY "Admins can view audit log" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- ============================================
-- PHASE 2: UPDATE RLS POLICIES FOR ADMIN PRIVILEGES
-- ============================================

-- Users table
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data or admins can update anyone" ON users;
CREATE POLICY "Users can update their own data or admins can update anyone" ON users
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- Polls table
DROP POLICY IF EXISTS "Users can delete their own polls" ON polls;
DROP POLICY IF EXISTS "Users can delete their own polls or admins can delete any poll" ON polls;
CREATE POLICY "Users can delete their own polls or admins can delete any poll" ON polls
  FOR DELETE USING (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

DROP POLICY IF EXISTS "Users can update their own polls" ON polls;
DROP POLICY IF EXISTS "Users can update their own polls or admins can update any poll" ON polls;
CREATE POLICY "Users can update their own polls or admins can update any poll" ON polls
  FOR UPDATE USING (
    auth.uid() = author_id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

DROP POLICY IF EXISTS "Authenticated users can create polls" ON polls;
DROP POLICY IF EXISTS "Active users can create polls" ON polls;
CREATE POLICY "Active users can create polls" ON polls
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.status = 'active')
  );

-- ============================================
-- ENGAGEMENT FEATURES: POLL STREAKS
-- ============================================

CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_vote_date DATE,
  streak_started_at DATE,
  total_voting_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_streak ON user_streaks(current_streak DESC);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Everyone can view streak leaderboard" ON user_streaks;
DROP POLICY IF EXISTS "Users can update their own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert their own streaks" ON user_streaks;

CREATE POLICY "Everyone can view streak leaderboard" ON user_streaks
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update streak when user votes
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_vote_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  SELECT last_vote_date, current_streak, longest_streak
  INTO v_last_vote_date, v_current_streak, v_longest_streak
  FROM user_streaks
  WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_vote_date, streak_started_at, total_voting_days)
    VALUES (NEW.user_id, 1, 1, v_today, v_today, 1);
  ELSIF v_last_vote_date = v_today THEN
    NULL;
  ELSIF v_last_vote_date = v_today - INTERVAL '1 day' THEN
    UPDATE user_streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_vote_date = v_today,
        total_voting_days = total_voting_days + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  ELSE
    UPDATE user_streaks
    SET current_streak = 1,
        last_vote_date = v_today,
        streak_started_at = v_today,
        total_voting_days = total_voting_days + 1,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_streak_on_vote ON votes;
CREATE TRIGGER update_streak_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- ============================================
-- ENGAGEMENT FEATURES: ANONYMOUS CONFESSION POLLS
-- ============================================

ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_confession BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_polls_is_confession ON polls(is_confession);

-- ============================================
-- ENGAGEMENT FEATURES: VOTE PREDICTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS vote_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predicted_percent_a INTEGER NOT NULL CHECK (predicted_percent_a >= 0 AND predicted_percent_a <= 100),
  actual_percent_a INTEGER,
  accuracy_score DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scored_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(poll_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_vote_predictions_user_id ON vote_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_vote_predictions_poll_id ON vote_predictions(poll_id);
CREATE INDEX IF NOT EXISTS idx_vote_predictions_accuracy ON vote_predictions(accuracy_score DESC);

ALTER TABLE vote_predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all predictions" ON vote_predictions;
DROP POLICY IF EXISTS "Users can create their own predictions" ON vote_predictions;
DROP POLICY IF EXISTS "System can update predictions" ON vote_predictions;

CREATE POLICY "Users can view all predictions" ON vote_predictions
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own predictions" ON vote_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update predictions" ON vote_predictions
  FOR UPDATE USING (true);

-- ============================================
-- SUCCESS!
-- ============================================
-- All Phase 2 + Engagement migrations applied.
-- Tables created/updated:
--   users          (status, status_reason, status_changed_at, status_changed_by)
--   polls          (is_deathmatch, is_shadow_deathmatch, option_a/b_owner_id,
--                   deathmatch_status, author_username, is_confession)
--   admin_audit_log (new table)
--   user_streaks    (new table + trigger)
--   vote_predictions (new table)
-- ============================================
