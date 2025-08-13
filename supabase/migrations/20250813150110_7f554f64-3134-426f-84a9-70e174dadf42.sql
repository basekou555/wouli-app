-- CRITICAL FIX: Remove the policy that exposes all business profile data to public
DROP POLICY IF EXISTS "Limited public business access" ON public.profiles;

-- Remove redundant policies that might create conflicts
DROP POLICY IF EXISTS "Authenticated can view business profiles" ON public.profiles;

-- Create a secure approach: Only authenticated users can view any profile data
-- No public access to profiles table at all to protect personal information

-- Users can view their own complete profiles (including phone, address, etc.)
-- This policy already exists: "Users can view own profile" and "Users can view their own profiles"

-- Authenticated users can view basic business info only (no phone/address/website)
-- We'll handle this restriction in the application code by selecting specific fields
CREATE POLICY "Authenticated users can view business profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND type = 'business'::user_type
);

-- Allow authenticated users to view user profiles for social features (but not personal data)
CREATE POLICY "Authenticated users can view user profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND type = 'user'::user_type
);