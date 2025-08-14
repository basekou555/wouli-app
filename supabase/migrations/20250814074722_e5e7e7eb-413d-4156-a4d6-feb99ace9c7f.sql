-- CRITICAL SECURITY FIX: Remove overly permissive RLS policies that expose personal data

-- 1. Fix profiles table - Remove policies that allow viewing other users' personal data
DROP POLICY IF EXISTS "Authenticated users can view business profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON public.profiles;

-- Keep only the safe policies for profiles (users can only access their own data)
-- The existing "Users can manage their own profile" policy is sufficient

-- 2. Fix business_events table - Remove public access to sensitive business metrics
DROP POLICY IF EXISTS "Public can view business events" ON public.business_events;

-- Create a new restricted policy for business events - only business owners can view their own events
-- The existing "Business owners can manage their events" policy already handles this correctly

-- 3. Fix event_participants table - Remove public access to user activity data
DROP POLICY IF EXISTS "Public can view participants" ON public.event_participants;

-- Create a restricted policy for viewing participants - only the user can see their own participation
CREATE POLICY "Users can view their own participation" 
ON public.event_participants 
FOR SELECT 
USING (auth.uid() = user_id);

-- Business owners should be able to see participants in their own events
CREATE POLICY "Business owners can view participants in their events" 
ON public.event_participants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_events be 
    WHERE be.id = event_participants.event_id 
    AND be.user_id = auth.uid()
  )
);

-- 4. Fix event_likes table - Remove public access to user activity data  
DROP POLICY IF EXISTS "Public can view likes" ON public.event_likes;

-- Create a restricted policy for viewing likes - only the user can see their own likes
CREATE POLICY "Users can view their own likes" 
ON public.event_likes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Business owners should be able to see likes on their own events
CREATE POLICY "Business owners can view likes on their events" 
ON public.event_likes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_events be 
    WHERE be.id = event_likes.event_id 
    AND be.user_id = auth.uid()
  )
);

-- 5. Create a secure public view for event listings without exposing sensitive business data
CREATE OR REPLACE VIEW public.public_events AS
SELECT 
  be.id,
  be.title,
  be.description,
  be.venue,
  be.custom_venue,
  be.category,
  be.event_type,
  be.price,
  be.date,
  be.time,
  be.image_url,
  be.venue_photo_url,
  be.ambiance_photo_url,
  be.capacity,
  be.is_recurring,
  -- Only show aggregated counts, not sensitive business metrics
  be.likes,
  be.participants,
  be.views
FROM public.business_events be
WHERE be.date >= CURRENT_DATE;

-- Grant public access to the safe events view
GRANT SELECT ON public.public_events TO anon, authenticated;

-- 6. Update the public business info function to ensure it only returns safe data
-- (This was already created in the previous migration, but let's ensure it's properly secured)
CREATE OR REPLACE FUNCTION public.get_public_business_info()
RETURNS TABLE(
  id uuid,
  username text,
  bio text,
  city text,
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.city,
    p.avatar_url
  FROM public.profiles p
  WHERE p.type = 'business'::user_type;
$function$;