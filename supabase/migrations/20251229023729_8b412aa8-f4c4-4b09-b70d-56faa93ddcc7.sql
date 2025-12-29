-- Étape 1 : Passer tous les événements 'validated' futurs en 'active'
UPDATE events 
SET status = 'active' 
WHERE status = 'validated' 
  AND date >= now()
  AND archived_at IS NULL;

-- Étape 2 : Recréer la vue active_events pour inclure 'validated' comme fallback
CREATE OR REPLACE VIEW active_events AS
SELECT 
    id, title, description, date, end_date, time, end_time,
    location, address, category, tags, image_url, external_url,
    price, max_participants, created_by, created_by_type, status,
    views, likes, participants, search_appearances,
    actual_participants, no_show_count, archived_at,
    created_at, updated_at
FROM events
WHERE status IN ('active', 'validated')
  AND archived_at IS NULL 
  AND date >= now();