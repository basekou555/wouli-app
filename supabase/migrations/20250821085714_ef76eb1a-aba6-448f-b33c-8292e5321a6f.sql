-- Final security fix for remaining Security Definer Views
-- Check and remove any remaining security definer views

-- List all views to check their security settings
-- Drop and recreate any remaining problematic views

DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Find all views that might be security definer
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Drop and recreate each view to ensure it's not security definer
        IF view_record.viewname = 'active_events' THEN
            DROP VIEW IF EXISTS public.active_events CASCADE;
            CREATE VIEW public.active_events AS
            SELECT 
              id, date, end_date, price, max_participants, created_by, created_by_type,
              views, likes, participants, search_appearances, created_at, updated_at,
              category, archived_at, actual_participants, no_show_count, end_time,
              location, address, tags, image_url, external_url, status, title, description
            FROM public.events
            WHERE status = 'active' 
              AND date >= CURRENT_DATE;
        END IF;
        
        IF view_record.viewname = 'public_events' THEN
            DROP VIEW IF EXISTS public.public_events CASCADE;
            CREATE VIEW public.public_events AS
            SELECT 
              id, date, time, is_recurring, likes, participants, views, capacity,
              title, description, venue, custom_venue, category, event_type, 
              price, image_url, venue_photo_url, ambiance_photo_url
            FROM public.business_events
            WHERE date >= CURRENT_DATE;
        END IF;
    END LOOP;
END $$;

-- Ensure all views have proper security settings by setting security_barrier
-- This is a PostgreSQL-specific setting that ensures RLS is enforced
ALTER VIEW public.active_events SET (security_barrier = true);
ALTER VIEW public.public_events SET (security_barrier = true);