-- Remove foreign key constraints for development (since auth is disabled)
ALTER TABLE roasters DROP CONSTRAINT IF EXISTS roasters_user_id_fkey;
ALTER TABLE coffees DROP CONSTRAINT IF EXISTS coffees_user_id_fkey;  
ALTER TABLE bags DROP CONSTRAINT IF EXISTS bags_user_id_fkey;
ALTER TABLE brews DROP CONSTRAINT IF EXISTS brews_user_id_fkey;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;