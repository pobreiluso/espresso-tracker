-- Add photo_url column to bags table
ALTER TABLE bags 
ADD COLUMN IF NOT EXISTS photo_url TEXT;