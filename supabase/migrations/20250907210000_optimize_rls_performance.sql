-- ===========================================================================
-- MIGRATION: Optimize RLS policy performance 
-- Replace auth.uid() with (select auth.uid()) to avoid re-evaluation per row
-- This significantly improves query performance at scale
-- ===========================================================================

-- Drop existing policies for bags and recreate with optimized auth functions
DROP POLICY IF EXISTS "Users can view their own bags" ON bags;
DROP POLICY IF EXISTS "Users can insert their own bags" ON bags;
DROP POLICY IF EXISTS "Users can update their own bags" ON bags;
DROP POLICY IF EXISTS "Users can delete their own bags" ON bags;

-- Create optimized policies for bags
CREATE POLICY "Users can view their own bags" ON bags
    FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own bags" ON bags
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own bags" ON bags
    FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own bags" ON bags
    FOR DELETE USING (user_id = (select auth.uid()));

-- Drop existing policies for brews and recreate with optimized auth functions
DROP POLICY IF EXISTS "Users can view their own brews" ON brews;
DROP POLICY IF EXISTS "Users can insert their own brews" ON brews;
DROP POLICY IF EXISTS "Users can update their own brews" ON brews;
DROP POLICY IF EXISTS "Users can delete their own brews" ON brews;

-- Create optimized policies for brews
CREATE POLICY "Users can view their own brews" ON brews
    FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own brews" ON brews
    FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own brews" ON brews
    FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own brews" ON brews
    FOR DELETE USING (user_id = (select auth.uid()));

-- Also optimize the global policies for roasters and coffees
DROP POLICY IF EXISTS "Authenticated users can insert roasters" ON roasters;
DROP POLICY IF EXISTS "Authenticated users can update roasters" ON roasters;
DROP POLICY IF EXISTS "Authenticated users can delete roasters" ON roasters;

CREATE POLICY "Authenticated users can insert roasters" ON roasters
    FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can update roasters" ON roasters
    FOR UPDATE USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can delete roasters" ON roasters
    FOR DELETE USING ((select auth.uid()) IS NOT NULL);

-- Optimize coffees policies
DROP POLICY IF EXISTS "Authenticated users can insert coffees" ON coffees;
DROP POLICY IF EXISTS "Authenticated users can update coffees" ON coffees;
DROP POLICY IF EXISTS "Authenticated users can delete coffees" ON coffees;

CREATE POLICY "Authenticated users can insert coffees" ON coffees
    FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can update coffees" ON coffees
    FOR UPDATE USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated users can delete coffees" ON coffees
    FOR DELETE USING ((select auth.uid()) IS NOT NULL);