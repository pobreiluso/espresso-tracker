-- ===========================================================================
-- MIGRATION: Optimize user_preferences RLS policy performance 
-- Replace auth.uid() with (select auth.uid()) to avoid re-evaluation per row
-- This completes the performance optimization for all tables
-- ===========================================================================

-- Drop existing policies for user_preferences and recreate with optimized auth functions
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON user_preferences;

-- Create optimized policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own preferences" ON user_preferences
    FOR DELETE USING (user_id = (select auth.uid()));