
-- 1) Colonnes d'archivage et de fin pour les événements "users"
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS actual_participants integer,
  ADD COLUMN IF NOT EXISTS no_show_count integer,
  ADD COLUMN IF NOT EXISTS end_time timestamptz;

-- Contraintes de statut (valeurs autorisées)
ALTER TABLE public.events
  ADD CONSTRAINT IF NOT EXISTS events_status_check
  CHECK (status IN ('active', 'grace_period', 'archived'));

-- 2) Vue pour ne retourner que les événements actifs (+ période de grâce)
CREATE OR REPLACE VIEW public.active_events AS
SELECT *
FROM public.events
WHERE status IN ('active', 'grace_period')
   OR (status IS NULL AND date >= CURRENT_DATE);

-- 3) Index pour des requêtes performantes
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events (status, date);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date);

-- 4) Colonnes pour système de rappels sur les participants
ALTER TABLE public.event_participants
  ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz;
