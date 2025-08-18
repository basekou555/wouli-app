-- Phase 2 (Correction v2): Backend Stabilization - Approche simplifiée

-- D'abord, supprimer la contrainte existante qui pose problème
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_date_check;

-- Ajouter les colonnes manquantes à la table events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS actual_participants integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS no_show_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS end_time timestamp with time zone;

-- Ajouter la contrainte de statut (ignorer si elle existe déjà)
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.events 
        ADD CONSTRAINT events_status_check 
        CHECK (status IN ('active', 'archived', 'cancelled'));
    EXCEPTION WHEN duplicate_object THEN
        -- La contrainte existe déjà, on continue
        NULL;
    END;
END $$;

-- Créer des index pour améliorer les performances des requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events (status, date);
CREATE INDEX IF NOT EXISTS idx_events_active_upcoming ON public.events (status, date) WHERE status = 'active';

-- Créer une vue pour les événements actifs et à venir
CREATE OR REPLACE VIEW public.active_events AS
SELECT *
FROM public.events
WHERE status = 'active' 
  AND date >= CURRENT_TIMESTAMP;

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
    archived_at = CASE WHEN archived_at IS NULL THEN now() ELSE archived_at END
  WHERE status = 'active' 
    AND (
      -- Événements terminés depuis plus de 2 heures (grace period)
      (end_time IS NOT NULL AND end_time < now() - INTERVAL '2 hours') OR
      -- Événements sans end_time, estimés à +3h, avec grace period de 2h = 5h total
      (end_time IS NULL AND date < now() - INTERVAL '5 hours')
    );
END;
$$;

-- Mettre à jour les événements existants pour avoir le bon statut
UPDATE public.events 
SET status = 'archived', archived_at = now()
WHERE status = 'active' 
  AND (
    (end_time IS NOT NULL AND end_time < now() - INTERVAL '2 hours') OR
    (end_time IS NULL AND date < now() - INTERVAL '5 hours')
  );

-- Créer un trigger pour auto-archiver lors des mises à jour
CREATE OR REPLACE FUNCTION public.check_event_archiving()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Si l'événement est dans le passé et encore actif, l'archiver
  IF NEW.status = 'active' AND (
    (NEW.end_time IS NOT NULL AND NEW.end_time < now() - INTERVAL '2 hours') OR
    (NEW.end_time IS NULL AND NEW.date < now() - INTERVAL '5 hours')
  ) THEN
    NEW.status := 'archived';
    NEW.archived_at := COALESCE(NEW.archived_at, now());
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_check_event_archiving ON public.events;
CREATE TRIGGER trigger_check_event_archiving
    BEFORE INSERT OR UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.check_event_archiving();