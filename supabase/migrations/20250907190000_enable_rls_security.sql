-- ===========================================================================
-- MIGRATION: Enable Row Level Security (RLS) on tables with policies
-- Fix security warnings by enabling RLS on tables that have policies defined
-- ===========================================================================

-- Enable RLS on bags table (has policies but RLS not enabled)
ALTER TABLE bags ENABLE ROW LEVEL SECURITY;

-- Enable RLS on brews table (has policies but RLS not enabled)  
ALTER TABLE brews ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_preferences table (has policies but RLS not enabled)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Verify RLS is already enabled on other tables (done in previous migration)
-- ALTER TABLE roasters ENABLE ROW LEVEL SECURITY; -- Already enabled
-- ALTER TABLE coffees ENABLE ROW LEVEL SECURITY; -- Already enabled