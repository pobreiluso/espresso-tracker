-- Fix storage policies for development environment
-- Allow public access for development since we're not using real authentication

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