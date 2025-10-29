-- ============================================
-- FIX NOTIFICATIONS INSERT POLICY
-- ============================================
-- This fixes the poll creation issue by adding the missing INSERT policy for notifications

-- Add INSERT policy for notifications
CREATE POLICY "Anyone can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- VERIFY
-- ============================================
-- Run this to see all notification policies:
-- SELECT policyname FROM pg_policies WHERE tablename = 'notifications';

-- ============================================
-- SUCCESS!
-- ============================================
-- ✅ Poll creation should now work!
-- The missing INSERT policy for notifications has been added.
