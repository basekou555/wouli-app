-- Active le temps réel (Realtime) sur la table scraper_runs.
--
-- Contexte : la migration 20251215215100 avait posé REPLICA IDENTITY FULL sur
-- scraper_runs, mais la table n'avait jamais été ajoutée à la publication
-- supabase_realtime. Résultat : la console et les compteurs de la page admin
-- "Contrôle Scraper" ne se mettaient jamais à jour, alors que le scraper
-- écrivait pourtant bien ses logs/compteurs en base.
--
-- Idempotent : ne fait rien si la table est déjà dans la publication.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'scraper_runs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE scraper_runs;
  END IF;
END $$;
