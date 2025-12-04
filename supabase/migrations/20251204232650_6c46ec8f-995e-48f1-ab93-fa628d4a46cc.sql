-- Recréer la vue public_events sans SECURITY DEFINER (utilise INVOKER par défaut)
DROP VIEW IF EXISTS public.public_events;

CREATE VIEW public.public_events AS
SELECT 
  e.id,
  e.title,
  e.description,
  e.date,
  e.time,
  e.location,
  e.category,
  e.price,
  e.image_url,
  e.external_url,
  e.views,
  e.likes,
  e.participants,
  e.created_at,
  e.created_by_type as source
FROM public.events e
WHERE e.status = 'active'
  AND e.archived_at IS NULL;