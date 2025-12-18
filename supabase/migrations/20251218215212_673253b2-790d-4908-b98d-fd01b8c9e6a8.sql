-- Add image_url column to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their service images
CREATE POLICY "Users can upload service images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-images');

-- Allow public read access to service images
CREATE POLICY "Service images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'service-images');

-- Allow users to update their own service images
CREATE POLICY "Users can update their service images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'service-images');

-- Allow users to delete their own service images
CREATE POLICY "Users can delete their service images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'service-images');