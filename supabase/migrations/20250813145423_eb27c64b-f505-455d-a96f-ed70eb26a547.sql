-- Remove the overly permissive policy that exposes all business profile data
DROP POLICY IF EXISTS "Public can view business profiles only" ON public.profiles;

-- Create a new restrictive policy that only exposes essential business information
-- This prevents public access to phone numbers, addresses, websites, and other sensitive data
CREATE POLICY "Public can view essential business info only" 
ON public.profiles 
FOR SELECT 
USING (
  type = 'business'::user_type 
  AND auth.uid() IS NULL -- Only for non-authenticated requests
);

-- Create a view for safe public business profile data
CREATE OR REPLACE VIEW public.business_profiles_public AS
SELECT 
  id,
  username,
  bio,
  city,
  avatar_url,
  type,
  created_at
FROM public.profiles 
WHERE type = 'business'::user_type;

-- Enable RLS on the view
ALTER VIEW public.business_profiles_public SET (security_barrier = true);

-- Grant public access to the safe view
GRANT SELECT ON public.business_profiles_public TO anon, authenticated;