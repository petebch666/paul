-- ─────────────────────────────────────────────────────────────
-- PAUL v2 Roadmap Migrations
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

-- 1. LLM moderation result column on polls
ALTER TABLE polls
  ADD COLUMN IF NOT EXISTS moderation_result JSONB;
-- stores { verdict, reason, confidence, model, timestamp }

-- 2. User bio column
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. User follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- 4a. Add created_at to votes (required by RPC and activity grid index)
ALTER TABLE votes
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4b. Atomic cast_vote RPC (fixes race condition)
-- This function inserts the vote and atomically increments the count
CREATE OR REPLACE FUNCTION cast_vote(
  p_poll_id UUID,
  p_user_id UUID,
  p_option TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert vote (will fail with unique constraint if already voted)
  -- created_at is populated by column default
  INSERT INTO votes (poll_id, user_id, option)
  VALUES (p_poll_id, p_user_id, p_option);

  -- Atomically increment the correct counter
  IF p_option = 'A' THEN
    UPDATE polls SET votes_option_a = votes_option_a + 1 WHERE id = p_poll_id;
  ELSE
    UPDATE polls SET votes_option_b = votes_option_b + 1 WHERE id = p_poll_id;
  END IF;
END;
$$;

-- 5. GIN index for poll search (future ILIKE optimisation)
CREATE INDEX IF NOT EXISTS idx_polls_title_gin ON polls USING gin(to_tsvector('english', title));

-- 6. Index for votes by user (activity grid)
CREATE INDEX IF NOT EXISTS idx_votes_user_created ON votes(user_id, created_at);

-- 7. Supabase DB trigger to call moderate-poll Edge Function after INSERT on polls
-- NOTE: Requires pg_net extension and the Edge Function to be deployed first.
-- Uncomment when ready to deploy:

-- CREATE OR REPLACE FUNCTION trigger_moderate_poll()
-- RETURNS trigger LANGUAGE plpgsql AS $$
-- BEGIN
--   PERFORM net.http_post(
--     url := current_setting('app.edge_function_url') || '/moderate-poll',
--     body := json_build_object('record', row_to_json(NEW))::text,
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' ||
--                current_setting('app.service_role_key') || '"}'
--   );
--   RETURN NEW;
-- END;
-- $$;

-- DROP TRIGGER IF EXISTS on_poll_insert_moderate ON polls;
-- CREATE TRIGGER on_poll_insert_moderate
--   AFTER INSERT ON polls
--   FOR EACH ROW EXECUTE FUNCTION trigger_moderate_poll();
