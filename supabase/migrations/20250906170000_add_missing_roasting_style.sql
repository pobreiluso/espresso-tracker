-- Add missing roasting_style column to roasters table
-- This column exists in the schema but may not have been applied correctly

ALTER TABLE roasters ADD COLUMN IF NOT EXISTS roasting_style TEXT;

-- Add comment for documentation
COMMENT ON COLUMN roasters.roasting_style IS 'Roasting style preference (e.g. Light, Medium, Dark, Nordic)';