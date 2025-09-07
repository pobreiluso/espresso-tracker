-- ===========================================================================
-- MIGRATION: Clean up unused and unnecessary indexes
-- Remove indexes that are not being used or no longer needed due to architecture changes
-- ===========================================================================

-- Drop user_id indexes from roasters and coffees (now global tables, no user_id filtering)
DROP INDEX IF EXISTS idx_roasters_user_id;
DROP INDEX IF EXISTS idx_coffees_user_id;

-- Drop potentially unused indexes (can be recreated later if needed)
-- These indexes were created but may not be used in current query patterns
DROP INDEX IF EXISTS idx_bags_coffee_id;  -- Basic foreign key, may not need index if not used for complex joins
DROP INDEX IF EXISTS idx_brews_rating;    -- Rating filtering might not be common enough to warrant index
DROP INDEX IF EXISTS idx_brews_analysis_timestamp;  -- Analysis timestamp might not be frequently queried
DROP INDEX IF EXISTS idx_brews_brewing_method;      -- Brewing method detection might not be frequently filtered
DROP INDEX IF EXISTS idx_brews_extraction_quality;  -- Extraction quality might not be frequently filtered

-- Keep essential indexes that are likely to be used:
-- - idx_bags_user_id (for user filtering)
-- - idx_bags_open_date (for open bags queries)
-- - idx_brews_user_id (for user filtering) 
-- - idx_brews_bag_id (for bag-specific brews)
-- - idx_brews_bag_id_analysis (for complex brew queries)
-- - idx_brews_date (for date-sorted queries)
-- - idx_brews_method (for method filtering)
-- - idx_coffees_roaster_id (for roaster-coffee relationships)
-- - idx_coffees_roaster_name (for roaster-name queries)
-- - idx_roasters_name (for roaster name searches)

-- Note: If any of the dropped indexes are needed later, they can be recreated
-- Monitor query performance and recreate specific indexes if needed