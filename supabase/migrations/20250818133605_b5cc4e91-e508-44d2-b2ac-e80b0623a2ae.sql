-- Phase 2 (Simplifiée): Backend Stabilization

-- D'abord, supprimer la contrainte existante qui pose problème
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_date_check;

-- Ajouter les colonnes manquantes à la table events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS actual_participants integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS no_show_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS end_time timestamp with time zone;

-- Ajouter la contrainte de statut de manière simple
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE public.events ADD CONSTRAINT events_status_check CHECK (status IN ('active', 'archived', 'cancelled'));

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events (status, date);
CREATE INDEX IF NOT EXISTS idx_events_active_upcoming ON public.events (status, date) WHERE status = 'active';

-- Créer une vue pour les événements actifs et à venir
CREATE OR REPLACE VIEW public.active_events AS
SELECT *
FROM public.events
WHERE status = 'active' 
  AND date >= CURRENT_TIMESTAMP;

-- Mettre à jour les événements existants pour avoir le bon statut
UPDATE public.events 
SET status = 'archived', archived_at = now()
WHERE status = 'active' 
  AND date < now() - INTERVAL '5 hours';

-- Créer une fonction pour archiver automatiquement les événements passés
CREATE OR REPLACE FUNCTION public.archive_past_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  UPDATE public.events 
  SET 
    status = 'archived',
    archived_at = COALESCE(archived_at, now())
  WHERE status = 'active' 
    AND (
      (end_time IS NOT NULL AND end_time < now() - INTERVAL '2 hours') OR
      (end_time IS NULL AND date < now() - INTERVAL '5 hours')
    );
END;
$$;