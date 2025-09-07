-- ===========================================================================
-- COMPLETE SUPABASE MIGRATIONS FOR COFFEE TRACKER - COMPREHENSIVE VERSION
-- Copy and paste this entire file into Supabase SQL Editor
-- This includes ALL 8 migrations in proper order
-- ===========================================================================

-- Migration 1: Create Complete Schema (20250906130000)
-- ===========================================================================

-- Create roasters table
CREATE TABLE IF NOT EXISTS roasters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    country VARCHAR,
    website VARCHAR,
    description TEXT,
    founded_year INTEGER,
    specialty VARCHAR, -- e.g. "Specialty Coffee", "Third Wave", "Single Origin"
    size_category VARCHAR, -- e.g. "Micro", "Small", "Medium", "Large"
    roasting_style VARCHAR, -- e.g. "Light", "Medium", "Dark", "Nordic"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create coffees table  
CREATE TABLE IF NOT EXISTS coffees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roaster_id UUID REFERENCES roasters(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR NOT NULL,
    origin_country VARCHAR,
    region VARCHAR,
    subregion VARCHAR, -- More specific area within region
    farm VARCHAR,
    producer VARCHAR, -- Producer/farmer name
    cooperative VARCHAR, -- Cooperative name if applicable
    variety VARCHAR,
    variety_details TEXT, -- More detailed variety information
    process VARCHAR,
    process_details TEXT, -- Detailed process description
    altitude INTEGER,
    altitude_range VARCHAR, -- e.g. "1200-1400m"
    harvest_season VARCHAR, -- e.g. "October-February"
    certification VARCHAR, -- e.g. "Organic, Fair Trade, Rainforest Alliance"
    cupping_score DECIMAL(3,1), -- SCA cupping score
    tasting_notes TEXT,
    flavor_profile JSON, -- Structured flavor data: acidity, body, sweetness, etc.
    coffee_story TEXT, -- Background story about the coffee/farm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create bags table
CREATE TABLE IF NOT EXISTS bags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coffee_id UUID REFERENCES coffees(id) ON DELETE CASCADE NOT NULL,
    size_g INTEGER NOT NULL,
    price DECIMAL(10,2),
    roast_date DATE NOT NULL,
    open_date DATE,
    finish_date DATE,
    purchase_location VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create brews table
CREATE TABLE IF NOT EXISTS brews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bag_id UUID REFERENCES bags(id) ON DELETE CASCADE NOT NULL,
    method VARCHAR NOT NULL CHECK (method IN ('espresso', 'v60', 'aeropress', 'chemex', 'kalita', 'frenchpress')),
    dose_g DECIMAL(4,1) NOT NULL CHECK (dose_g >= 5 AND dose_g <= 30),
    yield_g DECIMAL(5,1) NOT NULL,
    ratio DECIMAL(4,2) GENERATED ALWAYS AS (yield_g / dose_g) STORED,
    time_s INTEGER NOT NULL CHECK (time_s >= 5 AND time_s <= 90),
    grind_setting VARCHAR NOT NULL,
    water_temp_c INTEGER CHECK (water_temp_c BETWEEN 80 AND 100),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
    flavor_tags TEXT[], -- Array of flavor tags
    notes TEXT,
    brew_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    default_method VARCHAR DEFAULT 'v60' CHECK (default_method IN ('espresso', 'v60', 'aeropress', 'chemex', 'kalita', 'frenchpress')),
    units_temp VARCHAR DEFAULT 'celsius' CHECK (units_temp IN ('celsius', 'fahrenheit')),
    confirm_bag_finish BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE roasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE brews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roasters
CREATE POLICY "Users can view their own roasters" ON roasters 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own roasters" ON roasters 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own roasters" ON roasters 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own roasters" ON roasters 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for coffees
CREATE POLICY "Users can view their own coffees" ON coffees 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own coffees" ON coffees 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own coffees" ON coffees 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own coffees" ON coffees 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bags  
CREATE POLICY "Users can view their own bags" ON bags 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bags" ON bags 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bags" ON bags 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bags" ON bags 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for brews
CREATE POLICY "Users can view their own brews" ON brews 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own brews" ON brews 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own brews" ON brews 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own brews" ON brews 
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences 
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON user_preferences 
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_roasters_user_id ON roasters(user_id);
CREATE INDEX IF NOT EXISTS idx_coffees_user_id ON coffees(user_id);
CREATE INDEX IF NOT EXISTS idx_coffees_roaster_id ON coffees(roaster_id);
CREATE INDEX IF NOT EXISTS idx_bags_user_id ON bags(user_id);
CREATE INDEX IF NOT EXISTS idx_bags_coffee_id ON bags(coffee_id);
CREATE INDEX IF NOT EXISTS idx_bags_open_date ON bags(open_date) WHERE finish_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_brews_user_id ON brews(user_id);
CREATE INDEX IF NOT EXISTS idx_brews_bag_id ON brews(bag_id);
CREATE INDEX IF NOT EXISTS idx_brews_date ON brews(brew_date DESC);
CREATE INDEX IF NOT EXISTS idx_brews_rating ON brews(rating);
CREATE INDEX IF NOT EXISTS idx_brews_method ON brews(method);

-- Migration 2: Disable RLS for Development (20250906140000)
-- ===========================================================================

-- Temporarily disable RLS for development
ALTER TABLE roasters DISABLE ROW LEVEL SECURITY;
ALTER TABLE coffees DISABLE ROW LEVEL SECURITY;
ALTER TABLE bags DISABLE ROW LEVEL SECURITY;
ALTER TABLE brews DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Migration 3: Remove FK Constraints for Development (20250906150000)
-- ===========================================================================

-- Remove foreign key constraints for development (since auth is disabled)
ALTER TABLE roasters DROP CONSTRAINT IF EXISTS roasters_user_id_fkey;
ALTER TABLE coffees DROP CONSTRAINT IF EXISTS coffees_user_id_fkey;  
ALTER TABLE bags DROP CONSTRAINT IF EXISTS bags_user_id_fkey;
ALTER TABLE brews DROP CONSTRAINT IF EXISTS brews_user_id_fkey;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

-- Migration 4: Add Brew Analysis Schema (20250906160000)
-- ===========================================================================

-- Add brew analysis support to brews table
ALTER TABLE brews 
ADD COLUMN IF NOT EXISTS grind_setting INTEGER,
ADD COLUMN IF NOT EXISTS extraction_time_seconds INTEGER,
ADD COLUMN IF NOT EXISTS dose_grams DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS yield_grams DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS water_temp_celsius INTEGER,
ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
ADD COLUMN IF NOT EXISTS extraction_quality TEXT CHECK (extraction_quality IN ('under-extracted', 'properly-extracted', 'over-extracted')),
ADD COLUMN IF NOT EXISTS brewing_method_detected TEXT,
ADD COLUMN IF NOT EXISTS estimated_volume_ml INTEGER,
ADD COLUMN IF NOT EXISTS visual_score DECIMAL(3,1),
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS has_photo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_ai_analysis BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_brews_brewing_method ON brews(brewing_method_detected);
CREATE INDEX IF NOT EXISTS idx_brews_extraction_quality ON brews(extraction_quality);
CREATE INDEX IF NOT EXISTS idx_brews_analysis_timestamp ON brews(analysis_timestamp);
CREATE INDEX IF NOT EXISTS idx_brews_bag_id_analysis ON brews(bag_id, analysis_timestamp);

-- Add comments for documentation
COMMENT ON COLUMN brews.grind_setting IS 'Grinder setting number (e.g., 15 for Comandante)';
COMMENT ON COLUMN brews.extraction_time_seconds IS 'Total extraction time in seconds';
COMMENT ON COLUMN brews.dose_grams IS 'Coffee dose weight in grams';
COMMENT ON COLUMN brews.yield_grams IS 'Final brew weight in grams';
COMMENT ON COLUMN brews.water_temp_celsius IS 'Water temperature in Celsius';
COMMENT ON COLUMN brews.ai_analysis IS 'Full AI analysis result JSON from OpenAI';
COMMENT ON COLUMN brews.extraction_quality IS 'AI-determined extraction quality';
COMMENT ON COLUMN brews.brewing_method_detected IS 'AI-detected brewing method';
COMMENT ON COLUMN brews.estimated_volume_ml IS 'AI-estimated volume in milliliters';
COMMENT ON COLUMN brews.visual_score IS 'AI visual quality score (0-10)';
COMMENT ON COLUMN brews.confidence_score IS 'AI analysis confidence (0-1)';

-- Migration 5: Add Photo URL to Bags (20250906165013)
-- ===========================================================================

-- Add photo_url column to bags table
ALTER TABLE bags 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

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

-- Set up RLS policies for bag-photos bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload bag photos" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload bag photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'bag-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read access to bag photos" ON storage.objects;
CREATE POLICY "Allow public read access to bag photos" ON storage.objects
FOR SELECT USING (bucket_id = 'bag-photos');

DROP POLICY IF EXISTS "Allow authenticated users to delete their bag photos" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their bag photos" ON storage.objects
FOR DELETE USING (bucket_id = 'bag-photos' AND auth.role() = 'authenticated');

-- Set up RLS policies for brew-photos bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload brew photos" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload brew photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'brew-photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read access to brew photos" ON storage.objects;
CREATE POLICY "Allow public read access to brew photos" ON storage.objects
FOR SELECT USING (bucket_id = 'brew-photos');

DROP POLICY IF EXISTS "Allow authenticated users to delete their brew photos" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their brew photos" ON storage.objects
FOR DELETE USING (bucket_id = 'brew-photos' AND auth.role() = 'authenticated');

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

-- Migration 8: Add Missing Roasting Style Column (20250906170000)
-- ===========================================================================

-- Add missing roasting_style column to roasters table
-- This column exists in the schema but may not have been applied correctly
ALTER TABLE roasters ADD COLUMN IF NOT EXISTS roasting_style TEXT;

-- Add comment for documentation
COMMENT ON COLUMN roasters.roasting_style IS 'Roasting style preference (e.g. Light, Medium, Dark, Nordic)';

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
-- This file contains ALL 8 migrations in proper chronological order.