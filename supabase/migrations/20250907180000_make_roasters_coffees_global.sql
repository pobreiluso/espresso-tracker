-- ===========================================================================
-- MIGRATION: Make roasters and coffees global (remove user_id requirement)
-- This migration makes roasters and coffees shared across all users
-- while keeping bags and brews user-specific
-- ===========================================================================

-- Make user_id nullable in roasters table (make roasters global)
ALTER TABLE roasters 
ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in coffees table (make coffees global)  
ALTER TABLE coffees
ALTER COLUMN user_id DROP NOT NULL;

-- Update existing data to remove user_id from roasters (make them global)
-- This will make all existing roasters available to all users
UPDATE roasters SET user_id = NULL;

-- Update existing data to remove user_id from coffees (make them global)
-- This will make all existing coffees available to all users  
UPDATE coffees SET user_id = NULL;

-- Add indexes for better performance on global queries
CREATE INDEX IF NOT EXISTS idx_roasters_name ON roasters(name);
CREATE INDEX IF NOT EXISTS idx_coffees_roaster_name ON coffees(roaster_id, name);

-- Update RLS policies to allow global access to roasters and coffees
-- Drop existing RLS policies that filter by user_id
DROP POLICY IF EXISTS "Users can only see their own roasters" ON roasters;
DROP POLICY IF EXISTS "Users can only insert their own roasters" ON roasters;
DROP POLICY IF EXISTS "Users can only update their own roasters" ON roasters;
DROP POLICY IF EXISTS "Users can only delete their own roasters" ON roasters;

DROP POLICY IF EXISTS "Users can only see their own coffees" ON coffees;
DROP POLICY IF EXISTS "Users can only insert their own coffees" ON coffees;
DROP POLICY IF EXISTS "Users can only update their own coffees" ON coffees;
DROP POLICY IF EXISTS "Users can only delete their own coffees" ON coffees;

-- Create new RLS policies for global access
-- Roasters: Everyone can read, authenticated users can insert/update/delete
CREATE POLICY "Everyone can view roasters" ON roasters
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert roasters" ON roasters
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update roasters" ON roasters
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete roasters" ON roasters
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Coffees: Everyone can read, authenticated users can insert/update/delete
CREATE POLICY "Everyone can view coffees" ON coffees
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert coffees" ON coffees
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update coffees" ON coffees
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete coffees" ON coffees
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Verify RLS is still enabled
ALTER TABLE roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;

-- Note: bags and brews remain user-specific with their existing RLS policies