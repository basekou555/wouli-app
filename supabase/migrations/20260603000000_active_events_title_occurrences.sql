-- Recrée active_events avec un compteur d'occurrences du titre (par établissement)
-- pour dériver UNIQUE (1 occurrence) vs RÉCURRENT (>=2) + numéro d'édition.
-- Aucune colonne is_unique : tout est calculé. security_invoker préservé.
CREATE OR REPLACE VIEW active_events
WITH (security_invoker = true) AS
SELECT
    e.id, e.title, e.description, e.date, e.end_date, e.time, e.end_time,
    e.location, e.address, e.category, e.tags, e.image_url, e.external_url,
    e.price, e.max_participants, e.created_by, e.created_by_type, e.status,
    e.views, e.likes, e.participants, e.search_appearances,
    e.actual_participants, e.no_show_count, e.archived_at,
    e.created_at, e.updated_at,
    e.music_style,
    -- Nombre total d'occurrences du même titre pour le même organisateur (historique inclus)
    (SELECT count(*) FROM events e2
       WHERE lower(btrim(e2.title)) = lower(btrim(e.title))
         AND e2.created_by = e.created_by) AS title_occurrences,
    -- Rang chronologique de cette édition (1 = première)
    (SELECT count(*) FROM events e3
       WHERE lower(btrim(e3.title)) = lower(btrim(e.title))
         AND e3.created_by = e.created_by
         AND e3.date <= e.date) AS edition_number
FROM events e
WHERE e.status IN ('active', 'validated')
  AND e.archived_at IS NULL
  AND e.date >= now();
