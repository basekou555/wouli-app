-- Définir explicitement security_invoker=true pour toutes les vues
-- PostgreSQL < 15 utilise DEFINER par défaut, il faut forcer INVOKER

-- 1. active_events
DROP VIEW IF EXISTS public.active_events;
CREATE VIEW public.active_events 
WITH (security_invoker = true) AS
SELECT 
  e.id, e.title, e.description, e.date, e.end_date, e.time, e.end_time,
  e.location, e.address, e.category, e.tags, e.image_url, e.external_url,
  e.price, e.max_participants, e.created_by, e.created_by_type, e.status,
  e.views, e.likes, e.participants, e.search_appearances,
  e.actual_participants, e.no_show_count, e.archived_at, e.created_at, e.updated_at
FROM events e
WHERE e.status = 'active' AND e.archived_at IS NULL;

-- 2. business_all_events
DROP VIEW IF EXISTS public.business_all_events;
CREATE VIEW public.business_all_events 
WITH (security_invoker = true) AS
SELECT 
  e.id, e.title, e.description, e.date, e.time, e.location, e.address,
  e.category, e.price, e.image_url, e.external_url, e.status,
  e.views, e.likes, e.participants, e.venue_id, e.venue_instagram,
  e.venue_category, e.activity_type, e.music_style, e.ambiance,
  e.social_intensity, e.event_format, e.target_audience, e.claimed,
  e.archived_at, e.created_at, e.updated_at,
  COALESCE(e.venue_id, e.created_by) as owner_id,
  e.created_by_type::text as source
FROM events e
WHERE e.venue_id IS NOT NULL OR e.created_by_type = 'business';

-- 3. business_smart_benchmark
DROP VIEW IF EXISTS public.business_smart_benchmark;
CREATE VIEW public.business_smart_benchmark 
WITH (security_invoker = true) AS
SELECT 
  e.id as my_event_id, e.title as my_event_title, e.venue_id as my_venue_id,
  (SELECT ROUND(AVG(e2.views)::numeric, 2) FROM events e2 WHERE e2.category = e.category AND e2.id != e.id AND e2.status = 'active') as market_avg_views,
  (SELECT ROUND(AVG(e2.likes)::numeric, 2) FROM events e2 WHERE e2.category = e.category AND e2.id != e.id AND e2.status = 'active') as market_avg_likes,
  (SELECT ROUND(AVG(e2.participants)::numeric, 2) FROM events e2 WHERE e2.category = e.category AND e2.id != e.id AND e2.status = 'active') as market_avg_participants,
  (SELECT COUNT(*) FROM events e2 WHERE e2.category = e.category AND e2.id != e.id AND e2.status = 'active') as comparable_count,
  CASE WHEN (SELECT AVG(e2.views) FROM events e2 WHERE e2.category = e.category AND e2.id != e.id AND e2.status = 'active') > 0 
    THEN ROUND((e.views::numeric / NULLIF((SELECT AVG(e2.views) FROM events e2 WHERE e2.category = e.category AND e2.id != e.id AND e2.status = 'active'), 0)) * 100, 2)
    ELSE 100 END as performance_vs_market
FROM events e WHERE e.venue_id IS NOT NULL AND e.status = 'active';

-- 4. public_events
DROP VIEW IF EXISTS public.public_events;
CREATE VIEW public.public_events 
WITH (security_invoker = true) AS
SELECT 
  e.id, e.title, e.description, e.date, e.time, e.location, e.category,
  e.price, e.image_url, e.external_url, e.views, e.likes, e.participants,
  e.created_at, e.created_by_type as source
FROM public.events e
WHERE e.status = 'active' AND e.archived_at IS NULL;

-- 5. public_business_details
DROP VIEW IF EXISTS public.public_business_details;
CREATE VIEW public.public_business_details 
WITH (security_invoker = true) AS
SELECT 
  bd.id, bd.venue_name, bd.venue_category, bd.venue_subcategory,
  bd.establishment_type, bd.ambiance_generale, bd.primary_music_styles,
  bd.venue_specialties, bd.opening_hours, bd.created_at
FROM public.business_details bd;

-- 6. public_profiles
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  p.id, p.username, p.avatar_url, p.bio, p.city, p.type, p.created_at
FROM public.profiles p;