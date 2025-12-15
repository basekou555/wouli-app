-- 1. Fonction RPC atomique pour ajouter des logs
CREATE OR REPLACE FUNCTION append_scraper_log(run_id UUID, log_entry JSONB)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE scraper_runs 
  SET logs = (
    SELECT jsonb_agg(elem)
    FROM (
      SELECT elem FROM jsonb_array_elements(COALESCE(logs, '[]'::jsonb)) AS elem
      UNION ALL
      SELECT log_entry
    ) sub
  )
  WHERE id = run_id;
END;
$$;

-- 2. Activer le realtime sur scraper_runs
ALTER TABLE scraper_runs REPLICA IDENTITY FULL;