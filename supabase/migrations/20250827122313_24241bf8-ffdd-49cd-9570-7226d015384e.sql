-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events-images', 
  'events-images', 
  true, 
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Create RLS policies for the events-images bucket
CREATE POLICY "Admins can upload event images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'events-images' 
  AND is_admin_user()
);

CREATE POLICY "Admins can update event images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'events-images' 
  AND is_admin_user()
);

CREATE POLICY "Admins can delete event images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'events-images' 
  AND is_admin_user()
);

CREATE POLICY "Public can view event images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'events-images');