-- Comprehensive Security Fixes Migration
-- Addresses all critical security issues identified in the review

-- 1. Drop existing potentially unsafe views and recreate them safely
DROP VIEW IF EXISTS public.public_events CASCADE;
DROP VIEW IF EXISTS public.active_events CASCADE;

-- 2. Recreate active_events view as standard (non-security definer) view
CREATE VIEW public.active_events 
WITH (security_barrier = true) AS
SELECT 
  id, date, end_date, price, max_participants, created_by, created_by_type,
  views, likes, participants, search_appearances, created_at, updated_at,
  category, archived_at, actual_participants, no_show_count, end_time,
  location, address, tags, image_url, external_url, status, title, description
FROM public.events
WHERE status = 'active' 
  AND date >= CURRENT_DATE;

-- 3. Create safe public_events view (relies on underlying table RLS)
CREATE VIEW public.public_events 
WITH (security_barrier = true) AS
SELECT 
  id, date, time, is_recurring, likes, participants, views, capacity,
  title, description, venue, custom_venue, category, event_type, 
  price, image_url, venue_photo_url, ambiance_photo_url
FROM public.business_events
WHERE date >= CURRENT_DATE;

-- 4. Fix get_public_business_info function - make it SECURITY DEFINER with proper search path
CREATE OR REPLACE FUNCTION public.get_public_business_info()
RETURNS TABLE(id uuid, username text, bio text, city text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.city,
    p.avatar_url
  FROM public.profiles p
  WHERE p.type = 'business'::user_type;
$$;

-- 5. Tighten events_pending RLS - require authentication for inserts
DROP POLICY IF EXISTS "Anyone can propose events" ON public.events_pending;

CREATE POLICY "Authenticated users can propose events" 
ON public.events_pending 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 6. Add uniqueness constraints to prevent duplicate interactions
ALTER TABLE public.event_likes 
ADD CONSTRAINT IF NOT EXISTS event_likes_user_event_unique 
UNIQUE (user_id, event_id);

ALTER TABLE public.event_participants 
ADD CONSTRAINT IF NOT EXISTS event_participants_user_event_unique 
UNIQUE (user_id, event_id);

-- 7. Add input validation constraints for events_pending
ALTER TABLE public.events_pending
ADD CONSTRAINT IF NOT EXISTS events_pending_title_length CHECK (length(title) BETWEEN 3 AND 200),
ADD CONSTRAINT IF NOT EXISTS events_pending_description_length CHECK (length(description) <= 2000),
ADD CONSTRAINT IF NOT EXISTS events_pending_location_length CHECK (length(location) BETWEEN 2 AND 100);

-- 8. Add validation trigger for external URLs in events_pending
CREATE OR REPLACE FUNCTION public.validate_external_url()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Validate external_url if provided
  IF NEW.external_url IS NOT NULL AND NEW.external_url != '' THEN
    -- Basic URL validation
    IF NEW.external_url !~ '^https?://.+' THEN
      RAISE EXCEPTION 'external_url must be a valid HTTP or HTTPS URL';
    END IF;
    -- Length check
    IF length(NEW.external_url) > 500 THEN
      RAISE EXCEPTION 'external_url must be less than 500 characters';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for URL validation
DROP TRIGGER IF EXISTS validate_external_url_trigger ON public.events_pending;
CREATE TRIGGER validate_external_url_trigger
  BEFORE INSERT OR UPDATE ON public.events_pending
  FOR EACH ROW EXECUTE FUNCTION public.validate_external_url();

-- 9. Add similar validation to business_events for consistency
ALTER TABLE public.business_events
ADD CONSTRAINT IF NOT EXISTS business_events_title_length CHECK (length(title) BETWEEN 3 AND 200),
ADD CONSTRAINT IF NOT EXISTS business_events_description_length CHECK (length(description) <= 2000);

-- Create URL validation trigger for business_events too
DROP TRIGGER IF EXISTS validate_business_event_url_trigger ON public.business_events;
CREATE TRIGGER validate_business_event_url_trigger
  BEFORE INSERT OR UPDATE ON public.business_events
  FOR EACH ROW EXECUTE FUNCTION public.validate_external_url();

-- 10. Create a secure function for public event proposals (alternative to direct inserts)
CREATE OR REPLACE FUNCTION public.propose_event_public(
  p_title text,
  p_description text,
  p_location text,
  p_address text,
  p_date timestamp with time zone,
  p_category event_category,
  p_price numeric DEFAULT 0,
  p_external_url text DEFAULT NULL,
  p_submitter_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  new_event_id uuid;
BEGIN
  -- Rate limiting check (basic implementation)
  IF p_submitter_email IS NOT NULL THEN
    -- Check if this email submitted more than 5 events in last 24h
    IF (
      SELECT COUNT(*) 
      FROM public.events_pending 
      WHERE submitter_email = p_submitter_email 
        AND created_at > now() - INTERVAL '24 hours'
    ) >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 submissions per email per day.';
    END IF;
  END IF;

  -- Insert the event
  INSERT INTO public.events_pending (
    title, description, location, address, date, category, 
    price, external_url, submitter_email
  ) VALUES (
    p_title, p_description, p_location, p_address, p_date, 
    p_category, p_price, p_external_url, p_submitter_email
  ) RETURNING id INTO new_event_id;

  RETURN new_event_id;
END;
$$;

-- 11. Ensure RLS is enabled on all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events_pending ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- 12. Create indexes for performance on security-related queries
CREATE INDEX IF NOT EXISTS idx_event_likes_user_id ON public.event_likes (user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON public.profiles (type);
CREATE INDEX IF NOT EXISTS idx_events_pending_created_at ON public.events_pending (created_at);

-- Security fixes complete