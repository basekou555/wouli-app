
-- Corriger la fonction get_user_stats pour inclure les business_events
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
  events_liked INTEGER,
  events_participated INTEGER,
  events_created INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Compter les likes sur les événements users ET business
    (SELECT COUNT(*)::INTEGER FROM event_likes el 
     WHERE el.user_id = user_uuid AND (
       EXISTS (SELECT 1 FROM events e WHERE e.id = el.event_id) OR
       EXISTS (SELECT 1 FROM business_events be WHERE be.id = el.event_id)
     )),
    -- Compter les participations sur les événements users ET business
    (SELECT COUNT(*)::INTEGER FROM event_participants ep 
     WHERE ep.user_id = user_uuid AND (
       EXISTS (SELECT 1 FROM events e WHERE e.id = ep.event_id) OR
       EXISTS (SELECT 1 FROM business_events be WHERE be.id = ep.event_id)
     )),
    -- Compter les événements créés (users seulement)
    (SELECT COUNT(*)::INTEGER FROM events WHERE created_by = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
