-- Table pour tracker les exécutions du scraper
CREATE TABLE IF NOT EXISTS scraper_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Info run
  status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Déclencheur
  trigger_type VARCHAR(20), -- 'manual', 'scheduled', 'auto'
  triggered_by UUID,
  
  -- Scope
  accounts_targeted TEXT[], -- Liste des comptes ciblés (null = tous)
  accounts_count INTEGER,
  
  -- Résultats
  posts_analyzed INTEGER DEFAULT 0,
  events_found INTEGER DEFAULT 0,
  events_saved INTEGER DEFAULT 0,
  events_manual_review INTEGER DEFAULT 0,
  events_failed INTEGER DEFAULT 0,
  
  -- Erreurs
  error_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Logs (optionnel, pour debug)
  logs JSONB,
  
  -- Meta
  scraper_version VARCHAR(10) DEFAULT 'v5'
);

-- Index pour performance
CREATE INDEX idx_scraper_runs_created ON scraper_runs(created_at DESC);
CREATE INDEX idx_scraper_runs_status ON scraper_runs(status);

-- RLS
ALTER TABLE scraper_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read scraper_runs" ON scraper_runs
  FOR SELECT USING (is_admin_user());

CREATE POLICY "Admin insert scraper_runs" ON scraper_runs
  FOR INSERT WITH CHECK (is_admin_user());

CREATE POLICY "Admin update scraper_runs" ON scraper_runs
  FOR UPDATE USING (is_admin_user());