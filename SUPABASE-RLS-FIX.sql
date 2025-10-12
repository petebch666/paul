-- ============================================
-- FIX RLS POLICIES FOR USER CREATION
-- ============================================
-- Run this in Supabase SQL Editor to allow user creation

-- Drop the old policies if they exist
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Recreate with proper permissions
CREATE POLICY "Anyone can create users (for signup)" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR role = 'admin');

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (role = 'admin');

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';

-- ✅ After running this, you can re-run the migration to import the remaining users and polls!

