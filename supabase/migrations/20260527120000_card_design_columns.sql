-- Colonnes système de design de la carte Wouli
-- Alimentées par le scraper, toujours NULL jusqu'à la prochaine passe de scraping

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS color_card TEXT,
  ADD COLUMN IF NOT EXISTS energy TEXT
    CHECK (energy IN ('SCENE', 'CLUB', 'JOURNEE')),
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS is_unique BOOLEAN,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN;

CREATE INDEX IF NOT EXISTS idx_events_energy ON events(energy);
