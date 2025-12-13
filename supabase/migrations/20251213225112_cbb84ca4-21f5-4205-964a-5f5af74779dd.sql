-- Table pour tracker les erreurs du scraper
CREATE TABLE IF NOT EXISTS scraper_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Info erreur
  error_type VARCHAR(50) NOT NULL, -- 'timeout', 'batch_error', 'validation_error'
  error_message TEXT,
  error_code VARCHAR(20),
  
  -- Info scraping
  scraper_run_id UUID, -- Pour grouper les erreurs d'un même run
  account_username VARCHAR(100),
  batch_number INTEGER,
  
  -- Données événement perdu (JSON)
  event_data JSONB NOT NULL,
  
  -- Statut retry
  retry_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'success', 'failed'
  retry_count INTEGER DEFAULT 0,
  retry_at TIMESTAMP WITH TIME ZONE,
  retry_error TEXT,
  
  -- Meta
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Index pour performance
CREATE INDEX idx_scraper_errors_status ON scraper_errors(retry_status);
CREATE INDEX idx_scraper_errors_created ON scraper_errors(created_at DESC);
CREATE INDEX idx_scraper_errors_run ON scraper_errors(scraper_run_id);

-- RLS (Row Level Security)
ALTER TABLE scraper_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read scraper_errors" ON scraper_errors
  FOR SELECT USING (public.is_admin_user());

CREATE POLICY "Admin insert scraper_errors" ON scraper_errors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update scraper_errors" ON scraper_errors
  FOR UPDATE USING (public.is_admin_user());