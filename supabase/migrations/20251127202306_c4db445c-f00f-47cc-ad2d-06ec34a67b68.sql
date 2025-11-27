-- Supprimer l'ancienne fonction avec mauvais type (bigint)
DROP FUNCTION IF EXISTS public.increment_event_views(bigint);

-- Créer la nouvelle fonction avec UUID
CREATE OR REPLACE FUNCTION public.increment_event_views(p_event_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Incrémenter dans events
  UPDATE public.events
  SET views = COALESCE(views, 0) + 1
  WHERE id = p_event_id;
  
  -- Si aucune ligne affectée, essayer business_events
  IF NOT FOUND THEN
    UPDATE public.business_events
    SET views = COALESCE(views, 0) + 1
    WHERE id = p_event_id;
  END IF;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Autoriser les utilisateurs authentifiés à appeler cette fonction
GRANT EXECUTE ON FUNCTION public.increment_event_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_event_views(UUID) TO anon;