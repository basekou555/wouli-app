-- Recréer la vue business_smart_benchmark sans SECURITY DEFINER
DROP VIEW IF EXISTS public.business_smart_benchmark;

CREATE VIEW public.business_smart_benchmark AS
SELECT 
  e.id as my_event_id,
  e.title as my_event_title,
  e.venue_id as my_venue_id,
  -- Calcul des moyennes du marché pour les événements similaires (même catégorie, même période)
  (
    SELECT ROUND(AVG(e2.views)::numeric, 2)
    FROM events e2
    WHERE e2.category = e.category
      AND e2.id != e.id
      AND e2.status = 'active'
  ) as market_avg_views,
  (
    SELECT ROUND(AVG(e2.likes)::numeric, 2)
    FROM events e2
    WHERE e2.category = e.category
      AND e2.id != e.id
      AND e2.status = 'active'
  ) as market_avg_likes,
  (
    SELECT ROUND(AVG(e2.participants)::numeric, 2)
    FROM events e2
    WHERE e2.category = e.category
      AND e2.id != e.id
      AND e2.status = 'active'
  ) as market_avg_participants,
  (
    SELECT COUNT(*)
    FROM events e2
    WHERE e2.category = e.category
      AND e2.id != e.id
      AND e2.status = 'active'
  ) as comparable_count,
  -- Performance vs marché (ratio des vues par rapport à la moyenne)
  CASE 
    WHEN (SELECT AVG(e2.views) FROM events e2 WHERE e2.category = e.category AND e2.id != e.id AND e2.status = 'active') > 0 
    THEN ROUND((e.views::numeric / NULLIF((SELECT AVG(e2.views) FROM events e2 WHERE e2.category = e.category AND e2.id != e.id AND e2.status = 'active'), 0)) * 100, 2)
    ELSE 100
  END as performance_vs_market
FROM events e
WHERE e.venue_id IS NOT NULL
  AND e.status = 'active';