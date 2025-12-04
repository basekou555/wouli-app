-- Recréer la vue active_events sans SECURITY DEFINER
DROP VIEW IF EXISTS public.active_events;

CREATE VIEW public.active_events AS
SELECT 
  e.id,
  e.title,
  e.description,
  e.date,
  e.end_date,
  e.time,
  e.end_time,
  e.location,
  e.address,
  e.category,
  e.tags,
  e.image_url,
  e.external_url,
  e.price,
  e.max_participants,
  e.created_by,
  e.created_by_type,
  e.status,
  e.views,
  e.likes,
  e.participants,
  e.search_appearances,
  e.actual_participants,
  e.no_show_count,
  e.archived_at,
  e.created_at,
  e.updated_at
FROM events e
WHERE e.status = 'active'
  AND e.archived_at IS NULL;

-- Recréer la vue business_all_events sans SECURITY DEFINER
DROP VIEW IF EXISTS public.business_all_events;

CREATE VIEW public.business_all_events AS
SELECT 
  e.id,
  e.title,
  e.description,
  e.date,
  e.time,
  e.location,
  e.address,
  e.category,
  e.price,
  e.image_url,
  e.external_url,
  e.status,
  e.views,
  e.likes,
  e.participants,
  e.venue_id,
  e.venue_instagram,
  e.venue_category,
  e.activity_type,
  e.music_style,
  e.ambiance,
  e.social_intensity,
  e.event_format,
  e.target_audience,
  e.claimed,
  e.archived_at,
  e.created_at,
  e.updated_at,
  -- owner_id = venue_id si claimed, sinon created_by
  COALESCE(e.venue_id, e.created_by) as owner_id,
  -- source basée sur created_by_type
  e.created_by_type::text as source
FROM events e
WHERE e.venue_id IS NOT NULL 
   OR e.created_by_type = 'business';