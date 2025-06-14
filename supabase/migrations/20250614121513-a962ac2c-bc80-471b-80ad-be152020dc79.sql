
-- 1. Créer le nouvel enum pour les catégories d'événements Wouli
CREATE TYPE event_category_new AS ENUM ('a-boire', 'a-manger', 'soirees', 'activites');

-- 2. Ajouter une nouvelle colonne temporaire avec le nouveau type
ALTER TABLE events ADD COLUMN category_new event_category_new;

-- 3. Migrer les données existantes vers les nouvelles catégories
UPDATE events SET category_new = 
  CASE 
    WHEN category = 'bar' THEN 'a-boire'::event_category_new
    WHEN category = 'restaurant' THEN 'a-manger'::event_category_new
    WHEN category = 'club' THEN 'soirees'::event_category_new
    WHEN category = 'concert' THEN 'soirees'::event_category_new
    WHEN category = 'sport' THEN 'activites'::event_category_new
    WHEN category = 'culture' THEN 'activites'::event_category_new
    WHEN category = 'festival' THEN 'soirees'::event_category_new
    WHEN category = 'autre' THEN 'activites'::event_category_new
    ELSE 'activites'::event_category_new
  END;

-- 4. Supprimer l'ancienne colonne et renommer la nouvelle
ALTER TABLE events DROP COLUMN category;
ALTER TABLE events RENAME COLUMN category_new TO category;

-- 5. Rendre la colonne NOT NULL maintenant qu'elle est migrée
ALTER TABLE events ALTER COLUMN category SET NOT NULL;

-- 6. Supprimer l'ancien enum
DROP TYPE IF EXISTS event_category CASCADE;

-- 7. Renommer le nouveau enum
ALTER TYPE event_category_new RENAME TO event_category;

-- 8. Standardiser business_events pour utiliser les mêmes slugs dans event_type
UPDATE business_events SET event_type = 
  CASE 
    WHEN event_type ILIKE '%boire%' OR event_type ILIKE '%bar%' OR event_type ILIKE '%apéro%' THEN 'a-boire'
    WHEN event_type ILIKE '%manger%' OR event_type ILIKE '%restaurant%' OR event_type ILIKE '%brunch%' THEN 'a-manger'
    WHEN event_type ILIKE '%soirée%' OR event_type ILIKE '%club%' OR event_type ILIKE '%concert%' THEN 'soirees'
    WHEN event_type ILIKE '%activité%' OR event_type ILIKE '%sport%' OR event_type ILIKE '%culture%' THEN 'activites'
    ELSE 'activites'
  END;
