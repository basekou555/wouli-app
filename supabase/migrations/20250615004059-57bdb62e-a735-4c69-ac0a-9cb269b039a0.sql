
-- Fix the security issue with get_user_stats function
-- Set an immutable search_path to prevent security vulnerabilities
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
  events_liked INTEGER,
  events_participated INTEGER,
  events_created INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM event_likes WHERE user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM event_participants WHERE user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM events WHERE created_by = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
