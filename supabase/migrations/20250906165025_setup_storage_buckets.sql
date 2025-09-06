-- Create storage buckets for coffee tracker app

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