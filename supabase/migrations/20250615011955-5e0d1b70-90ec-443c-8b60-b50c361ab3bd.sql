
-- Fix the security issue with increment_event_views function
-- Set an immutable search_path to prevent security vulnerabilities
CREATE OR REPLACE FUNCTION public.increment_event_views(event_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE events SET views = views + 1 WHERE id = event_id;
END;
$$;
