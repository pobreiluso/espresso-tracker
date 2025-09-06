-- ===========================================================================
-- COMPLETE SUPABASE MIGRATIONS FOR COFFEE TRACKER
-- Copy and paste this entire file into Supabase SQL Editor
-- ===========================================================================

-- Migration 1: Create Schema (20250906130000)
-- ===========================================================================

-- Create roasters table
CREATE TABLE IF NOT EXISTS roasters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT,
    website TEXT,
    founded_year INTEGER,
    specialty TEXT,
    size_category TEXT CHECK (size_category IN ('Micro', 'Small', 'Medium', 'Large')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create coffees table
CREATE TABLE IF NOT EXISTS coffees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roaster_id UUID REFERENCES roasters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    origin_country TEXT,
    region TEXT,
    farm TEXT,
    variety TEXT,
    process TEXT,
    altitude INTEGER,
    cupping_score DECIMAL(4,1),
    harvest_season TEXT,
    certification TEXT,
    tasting_notes TEXT,
    flavor_profile JSONB,
    coffee_story TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bags table
CREATE TABLE IF NOT EXISTS bags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coffee_id UUID REFERENCES coffees(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    size_g INTEGER NOT NULL,
    price DECIMAL(8,2),
    roast_date DATE NOT NULL,
    open_date DATE,
    finish_date DATE,
    purchase_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create brews table
CREATE TABLE IF NOT EXISTS brews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bag_id UUID REFERENCES bags(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('espresso', 'v60', 'aeropress', 'chemex', 'kalita', 'frenchpress')),
    dose_g DECIMAL(4,1) NOT NULL CHECK (dose_g >= 5 AND dose_g <= 30),
    yield_g DECIMAL(5,1) NOT NULL,
    time_s INTEGER NOT NULL CHECK (time_s >= 5 AND time_s <= 90),
    grind_setting TEXT NOT NULL,
    water_temp_c INTEGER CHECK (water_temp_c >= 60 AND water_temp_c <= 100),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
    ratio DECIMAL(4,2),
    flavor_tags TEXT[],
    notes TEXT,
    brew_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    default_dose_g DECIMAL(4,1),
    default_water_temp_c INTEGER,
    default_grind_setting INTEGER,
    preferred_methods TEXT[] DEFAULT '{}',
    ai_analysis_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bags_coffee_id ON bags(coffee_id);
CREATE INDEX IF NOT EXISTS idx_bags_user_id ON bags(user_id);
CREATE INDEX IF NOT EXISTS idx_bags_roast_date ON bags(roast_date);
CREATE INDEX IF NOT EXISTS idx_bags_finish_date ON bags(finish_date) WHERE finish_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_brews_bag_id ON brews(bag_id);
CREATE INDEX IF NOT EXISTS idx_brews_user_id ON brews(user_id);
CREATE INDEX IF NOT EXISTS idx_brews_method ON brews(method);
CREATE INDEX IF NOT EXISTS idx_brews_rating ON brews(rating);
CREATE INDEX IF NOT EXISTS idx_brews_brew_date ON brews(brew_date);

CREATE INDEX IF NOT EXISTS idx_coffees_roaster_id ON coffees(roaster_id);
CREATE INDEX IF NOT EXISTS idx_coffees_origin_country ON coffees(origin_country);

-- Migration 2: Disable RLS for Development (20250906140000)
-- ===========================================================================

-- Disable RLS for development environment
ALTER TABLE roasters DISABLE ROW LEVEL SECURITY;
ALTER TABLE coffees DISABLE ROW LEVEL SECURITY;
ALTER TABLE bags DISABLE ROW LEVEL SECURITY;
ALTER TABLE brews DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Migration 3: Remove FK Constraints for Development (20250906150000)
-- ===========================================================================

-- Drop foreign key constraints for easier development
-- (Note: In production, you may want to keep these for data integrity)
-- ALTER TABLE coffees DROP CONSTRAINT IF EXISTS coffees_roaster_id_fkey;
-- ALTER TABLE bags DROP CONSTRAINT IF EXISTS bags_coffee_id_fkey;
-- ALTER TABLE brews DROP CONSTRAINT IF EXISTS brews_bag_id_fkey;

-- Migration 4: Add Brew Analysis Schema (20250906160000)
-- ===========================================================================

-- Add AI analysis fields to brews table
ALTER TABLE brews ADD COLUMN IF NOT EXISTS ai_analysis JSONB;
ALTER TABLE brews ADD COLUMN IF NOT EXISTS extraction_quality TEXT CHECK (extraction_quality IN ('under-extracted', 'properly-extracted', 'over-extracted'));
ALTER TABLE brews ADD COLUMN IF NOT EXISTS brewing_method_detected TEXT;
ALTER TABLE brews ADD COLUMN IF NOT EXISTS visual_score DECIMAL(3,1) CHECK (visual_score >= 0 AND visual_score <= 10);
ALTER TABLE brews ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1);
ALTER TABLE brews ADD COLUMN IF NOT EXISTS has_ai_analysis BOOLEAN DEFAULT FALSE;
ALTER TABLE brews ADD COLUMN IF NOT EXISTS extraction_time_seconds INTEGER;
ALTER TABLE brews ADD COLUMN IF NOT EXISTS dose_grams DECIMAL(4,1);
ALTER TABLE brews ADD COLUMN IF NOT EXISTS yield_grams DECIMAL(5,1);
ALTER TABLE brews ADD COLUMN IF NOT EXISTS water_temp_celsius INTEGER;
ALTER TABLE brews ADD COLUMN IF NOT EXISTS estimated_volume_ml INTEGER;
ALTER TABLE brews ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE brews ADD COLUMN IF NOT EXISTS analysis_timestamp TIMESTAMP WITH TIME ZONE;

-- Create index for AI analysis queries
CREATE INDEX IF NOT EXISTS idx_brews_has_ai_analysis ON brews(has_ai_analysis) WHERE has_ai_analysis = true;

-- Migration 5: Add Photo URL to Bags (20250906165013)
-- ===========================================================================

-- Add photo_url column to bags table
ALTER TABLE bags ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Migration 6: Setup Storage Buckets (20250906165025)
-- ===========================================================================

-- Create bag-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('bag-photos', 'bag-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create brew-photos bucket  
INSERT INTO storage.buckets (id, name, public)
VALUES ('brew-photos', 'brew-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Migration 7: Fix Storage Policies for Development (20250906165417)
-- ===========================================================================

-- Drop ALL existing policies for storage.objects related to our buckets
DROP POLICY IF EXISTS "Allow authenticated users to upload bag photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload brew photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their bag photos" ON storage.objects;  
DROP POLICY IF EXISTS "Allow authenticated users to delete their brew photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to bag photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to brew photos" ON storage.objects;

-- Create permissive policies for development environment
CREATE POLICY "Allow all uploads to bag photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bag-photos');

CREATE POLICY "Allow all uploads to brew photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'brew-photos');

CREATE POLICY "Allow all deletes from bag photos" ON storage.objects
FOR DELETE USING (bucket_id = 'bag-photos');

CREATE POLICY "Allow all deletes from brew photos" ON storage.objects
FOR DELETE USING (bucket_id = 'brew-photos');

CREATE POLICY "Allow public read access to bag photos" ON storage.objects
FOR SELECT USING (bucket_id = 'bag-photos');

CREATE POLICY "Allow public read access to brew photos" ON storage.objects
FOR SELECT USING (bucket_id = 'brew-photos');

-- ===========================================================================
-- UTILITY FUNCTIONS
-- ===========================================================================

-- Function to automatically calculate brew ratio
CREATE OR REPLACE FUNCTION calculate_brew_ratio()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.dose_g > 0 AND NEW.yield_g > 0 THEN
        NEW.ratio = ROUND((NEW.yield_g / NEW.dose_g)::numeric, 2);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply ratio calculation trigger to brews
DROP TRIGGER IF EXISTS calculate_brews_ratio ON brews;
CREATE TRIGGER calculate_brews_ratio 
    BEFORE INSERT OR UPDATE ON brews 
    FOR EACH ROW 
    EXECUTE FUNCTION calculate_brew_ratio();

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to user_preferences table
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================================================
-- SAMPLE DATA (Optional - Remove if not needed)
-- ===========================================================================

-- Insert sample roasters
INSERT INTO roasters (name, country, specialty, size_category) VALUES
    ('Blue Bottle Coffee', 'United States', 'Third Wave', 'Large'),
    ('Intelligentsia', 'United States', 'Third Wave', 'Large'),
    ('Counter Culture', 'United States', 'Direct Trade', 'Medium')
ON CONFLICT DO NOTHING;

-- ===========================================================================
-- COMPLETION MESSAGE
-- ===========================================================================

-- Database setup complete!
-- All tables, indexes, storage buckets, and policies are now ready.
-- The application should work with full photo storage and AI analysis capabilities.