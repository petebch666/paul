-- ============================================
-- FIX DEV RESET - ADD MISSING RLS POLICIES
-- ============================================
-- This fixes the DEV RESET button by adding the missing DELETE policies
-- Run this in your Supabase SQL Editor if DEV RESET is not working

-- ============================================
-- VOTES TABLE - Add DELETE policy
-- ============================================
-- Allow deletion of votes (needed for dev reset)
DROP POLICY IF EXISTS "Users can delete votes" ON votes;
CREATE POLICY "Users can delete votes" ON votes
  FOR DELETE USING (true);

-- ============================================
-- POLLS TABLE - Fix UPDATE policy to allow updates on all polls
-- ============================================
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can update their own polls" ON polls;
-- Add more permissive policy for dev reset
CREATE POLICY "Users can update any polls" ON polls
  FOR UPDATE USING (true);

-- Optionally keep the old policy name if you want both
-- CREATE POLICY "Users can update polls" ON polls
--   FOR UPDATE USING (true);

-- ============================================
-- POLLS TABLE - Allow deletion of any poll
-- ============================================
-- The existing policy is already permissive, but let's make sure it's there
DROP POLICY IF EXISTS "Users can delete polls" ON polls;
CREATE POLICY "Users can delete polls" ON polls
  FOR DELETE USING (true);

-- ============================================
-- NOTIFICATIONS TABLE - Add DELETE policy
-- ============================================
DROP POLICY IF EXISTS "Users can delete notifications" ON notifications;
CREATE POLICY "Users can delete notifications" ON notifications
  FOR DELETE USING (true);

-- ============================================
-- POLL_HISTORY TABLE - Add DELETE policy
-- ============================================
DROP POLICY IF EXISTS "Users can delete poll history" ON poll_history;
CREATE POLICY "Users can delete poll history" ON poll_history
  FOR DELETE USING (true);

-- ============================================
-- USERS TABLE - Allow updating any user
-- ============================================
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can update their own data" ON users;
-- Add more permissive policy for dev reset
CREATE POLICY "Users can update any user data" ON users
  FOR UPDATE USING (true);

-- ============================================
-- VERIFY POLICIES
-- ============================================
-- Run this to see all policies:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- ============================================
-- SUCCESS!
-- ============================================
-- ✅ DEV RESET should now work!
-- All policies have been updated to allow:
-- - Deleting votes
-- - Updating/deleting any poll
-- - Deleting notifications and history
-- - Updating any user data
