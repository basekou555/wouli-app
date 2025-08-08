
-- 1) Table pour les événements proposés par la communauté
CREATE TABLE IF NOT EXISTS public.events_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  category public.event_category NOT NULL,
  price NUMERIC DEFAULT 0,
  external_url TEXT,
  submitter_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- valeurs attendues: pending | approved | rejected
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Index pour des requêtes efficaces
CREATE INDEX IF NOT EXISTS idx_events_pending_status ON public.events_pending(status);
CREATE INDEX IF NOT EXISTS idx_events_pending_created ON public.events_pending(created_at);

-- 3) Activer RLS
ALTER TABLE public.events_pending ENABLE ROW LEVEL SECURITY;

-- 4) Politiques RLS
-- 4.1 Tout le monde (même non connecté) peut proposer un événement
DROP POLICY IF EXISTS "Anyone can propose events" ON public.events_pending;
CREATE POLICY "Anyone can propose events"
  ON public.events_pending
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 4.2 Seuls les comptes business peuvent LIRE la table (modération)
DROP POLICY IF EXISTS "Business can view pending events" ON public.events_pending;
CREATE POLICY "Business can view pending events"
  ON public.events_pending
  FOR SELECT
  TO authenticated
  USING (public.is_business_user());

-- 4.3 Seuls les comptes business peuvent METTRE À JOUR (valider/rejeter)
DROP POLICY IF EXISTS "Business can update pending events" ON public.events_pending;
CREATE POLICY "Business can update pending events"
  ON public.events_pending
  FOR UPDATE
  TO authenticated
  USING (public.is_business_user())
  WITH CHECK (public.is_business_user());

-- 4.4 Seuls les comptes business peuvent SUPPRIMER si besoin
DROP POLICY IF EXISTS "Business can delete pending events" ON public.events_pending;
CREATE POLICY "Business can delete pending events"
  ON public.events_pending
  FOR DELETE
  TO authenticated
  USING (public.is_business_user());

-- 5) Trigger: quand le statut passe à 'approved' ou 'rejected',
--    renseigner automatiquement validated_at et validated_by (si non fournis)
CREATE OR REPLACE FUNCTION public.set_events_pending_validation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('approved', 'rejected') THEN
     IF NEW.validated_at IS NULL THEN
       NEW.validated_at := now();
     END IF;
     IF NEW.validated_by IS NULL THEN
       NEW.validated_by := auth.uid();
     END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_events_pending_validation ON public.events_pending;
CREATE TRIGGER trg_events_pending_validation
BEFORE UPDATE ON public.events_pending
FOR EACH ROW
EXECUTE FUNCTION public.set_events_pending_validation();
