-- ============================================
-- DEATHMATCH POLLS - DATABASE MIGRATION
-- ============================================
-- Run this in your Supabase SQL Editor to add deathmatch support
-- 
-- IMPORTANT: Make sure you're in the correct Supabase project!
-- Current project URL: https://bozdmfofraqhpubrddqo.supabase.co
-- Verify this matches your "paul" project in Supabase dashboard

-- Add deathmatch columns to polls table
ALTER TABLE polls 
ADD COLUMN IF NOT EXISTS option_a_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS option_b_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_deathmatch BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_shadow_deathmatch BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deathmatch_status TEXT DEFAULT 'accepted' CHECK (deathmatch_status IN ('pending', 'accepted', 'rejected')),
ADD COLUMN IF NOT EXISTS author_username TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_option_a_owner ON polls(option_a_owner_id);
CREATE INDEX IF NOT EXISTS idx_polls_option_b_owner ON polls(option_b_owner_id);
CREATE INDEX IF NOT EXISTS idx_polls_is_deathmatch ON polls(is_deathmatch);

-- Update existing polls (set is_deathmatch based on owners)
UPDATE polls 
SET is_deathmatch = (option_a_owner_id IS NOT NULL AND option_b_owner_id IS NOT NULL)
WHERE is_deathmatch IS NULL;

-- Set default for existing polls
UPDATE polls SET is_deathmatch = FALSE WHERE is_deathmatch IS NULL;

-- ============================================
-- VERIFY
-- ============================================
-- Check columns were added:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'polls' AND column_name IN ('option_a_owner_id', 'option_b_owner_id', 'is_deathmatch');

-- ============================================
-- SUCCESS!
-- ============================================
-- ✅ Database is ready for deathmatch polls!
