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