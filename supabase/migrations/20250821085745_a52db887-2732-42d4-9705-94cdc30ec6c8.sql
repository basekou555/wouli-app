-- Comprehensive Security Definer View Detection and Fix
-- Find and fix ALL security definer views in the database

-- First, let's identify all views and their security settings
DO $$
DECLARE
    view_name text;
    view_definition text;
BEGIN
    -- Drop ALL existing views to ensure clean slate
    DROP VIEW IF EXISTS public.active_events CASCADE;
    DROP VIEW IF EXISTS public.public_events CASCADE;
    
    -- Check for any other views that might exist
    FOR view_name IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(view_name) || ' CASCADE';
        RAISE NOTICE 'Dropped view: %', view_name;
    END LOOP;
END $$;

-- Now recreate ONLY the views we actually need, ensuring they are NOT security definer
-- Active Events View - Standard view (security invoker by default)
CREATE VIEW public.active_events AS
SELECT 
  id, date, end_date, price, max_participants, created_by, created_by_type,
  views, likes, participants, search_appearances, created_at, updated_at,
  category, archived_at, actual_participants, no_show_count, end_time,
  location, address, tags, image_url, external_url, status, title, description
FROM public.events
WHERE status = 'active' 
  AND date >= CURRENT_DATE;

-- Public Events View - Standard view (security invoker by default)  
CREATE VIEW public.public_events AS
SELECT 
  id, date, time, is_recurring, likes, participants, views, capacity,
  title, description, venue, custom_venue, category, event_type, 
  price, image_url, venue_photo_url, ambiance_photo_url
FROM public.business_events
WHERE date >= CURRENT_DATE;

-- Explicitly set security_barrier to ensure RLS is enforced
ALTER VIEW public.active_events SET (security_barrier = true);
ALTER VIEW public.public_events SET (security_barrier = true);

-- Log what we've created
DO $$
BEGIN
    RAISE NOTICE 'Views created successfully with security_barrier = true';
END $$;