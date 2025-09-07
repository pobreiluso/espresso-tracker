-- ===========================================================================
-- MIGRATION: Clean up duplicate and conflicting RLS policies
-- Remove old user-specific policies that conflict with new global policies
-- ===========================================================================

-- Remove old user-specific policies from roasters (conflicting with global policies)
DROP POLICY IF EXISTS "Users can view their own roasters" ON roasters;
DROP POLICY IF EXISTS "Users can insert their own roasters" ON roasters;  
DROP POLICY IF EXISTS "Users can update their own roasters" ON roasters;
DROP POLICY IF EXISTS "Users can delete their own roasters" ON roasters;

-- Remove old user-specific policies from coffees (conflicting with global policies)
DROP POLICY IF EXISTS "Users can view their own coffees" ON coffees;
DROP POLICY IF EXISTS "Users can insert their own coffees" ON coffees;
DROP POLICY IF EXISTS "Users can update their own coffees" ON coffees;
DROP POLICY IF EXISTS "Users can delete their own coffees" ON coffees;

-- Verify that the correct global policies remain:
-- For roasters: Everyone can view, authenticated users can insert/update/delete
-- For coffees: Everyone can view, authenticated users can insert/update/delete
-- For bags: Users can only access their own (per-user policies)
-- For brews: Users can only access their own (per-user policies)