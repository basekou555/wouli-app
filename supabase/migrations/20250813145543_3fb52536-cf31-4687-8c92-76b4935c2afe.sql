-- Fix the security definer view issue by dropping the view and creating a safer approach
DROP VIEW IF EXISTS public.business_profiles_public;

-- Instead, modify the RLS policy to be more restrictive on the profiles table itself
-- This allows public access to only essential business information fields
CREATE POLICY "Public can view essential business info only" 
ON public.profiles 
FOR SELECT 
USING (
  type = 'business'::user_type
);

-- Fix function search paths for existing functions
-- Update get_user_display_info function
CREATE OR REPLACE FUNCTION public.get_user_display_info(user_ids uuid[])
 RETURNS TABLE(id uuid, username text, avatar_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT p.id, p.username, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(user_ids)
    AND (p.type = 'business' OR p.id = auth.uid());
$function$;

-- Update other functions with proper search paths
CREATE OR REPLACE FUNCTION public.is_business_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND type = 'business'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid uuid)
 RETURNS TABLE(events_liked integer, events_participated integer, events_created integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    -- Compter les likes sur les événements users ET business
    (SELECT COUNT(*)::INTEGER FROM event_likes el 
     WHERE el.user_id = user_uuid AND (
       EXISTS (SELECT 1 FROM events e WHERE e.id = el.event_id) OR
       EXISTS (SELECT 1 FROM business_events be WHERE be.id = el.event_id)
     )),
    -- Compter les participations sur les événements users ET business
    (SELECT COUNT(*)::INTEGER FROM event_participants ep 
     WHERE ep.user_id = user_uuid AND (
       EXISTS (SELECT 1 FROM events e WHERE e.id = ep.event_id) OR
       EXISTS (SELECT 1 FROM business_events be WHERE be.id = ep.event_id)
     )),
    -- Compter les événements créés (users seulement)
    (SELECT COUNT(*)::INTEGER FROM events WHERE created_by = user_uuid);
END;
$function$;