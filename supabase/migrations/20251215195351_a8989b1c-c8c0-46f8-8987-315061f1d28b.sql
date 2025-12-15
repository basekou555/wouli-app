-- Activer RLS sur scraper_stats
ALTER TABLE scraper_stats ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour admin
CREATE POLICY "Admin read scraper_stats" ON scraper_stats
  FOR SELECT USING (is_admin_user());

-- Politique d'insertion
CREATE POLICY "Admin insert scraper_stats" ON scraper_stats
  FOR INSERT WITH CHECK (true);

-- Politique de mise à jour
CREATE POLICY "Admin update scraper_stats" ON scraper_stats
  FOR UPDATE USING (is_admin_user());