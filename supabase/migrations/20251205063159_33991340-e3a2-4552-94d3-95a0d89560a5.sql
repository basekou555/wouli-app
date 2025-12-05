-- Recréer la vue active_events avec filtre sur les dates futures
DROP VIEW IF EXISTS public.active_events;

CREATE VIEW public.active_events 
WITH (security_invoker = true)
AS
SELECT 
  id, title, description, date, end_date, time, end_time, 
  location, address, category, tags, image_url, external_url, 
  price, max_participants, created_by, created_by_type, status, 
  views, likes, participants, search_appearances, actual_participants, 
  no_show_count, archived_at, created_at, updated_at
FROM public.events
WHERE status = 'active' 
  AND archived_at IS NULL
  AND date >= NOW();

-- Archiver les événements passés existants
SELECT public.archive_past_events();