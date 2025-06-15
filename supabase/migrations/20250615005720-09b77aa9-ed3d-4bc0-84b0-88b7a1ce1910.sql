
-- Fix the security issue with increment_event_participants_counter function
-- Set an immutable search_path to prevent security vulnerabilities
CREATE OR REPLACE FUNCTION public.increment_event_participants_counter(event_id uuid, table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  IF table_name = 'events' THEN
    UPDATE events SET participants = COALESCE(participants, 0) + 1 WHERE id = event_id;
  ELSIF table_name = 'business_events' THEN
    UPDATE business_events SET participants = COALESCE(participants, 0) + 1 WHERE id = event_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas faire échouer la transaction
    RAISE NOTICE 'Erreur lors de la mise à jour des participants: %', SQLERRM;
END;
$$;
