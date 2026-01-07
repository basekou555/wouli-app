-- =============================================
-- PHASE 1: SYSTÈME DE RECOMMANDATIONS WOULI
-- =============================================

-- 1. TABLE user_preferences - Stockage des préférences utilisateur
CREATE TABLE public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  selected_keywords TEXT[] NOT NULL DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  
  -- Préférences calculées (mis à jour par triggers/cron)
  category_scores JSONB DEFAULT '{}',
  keyword_scores JSONB DEFAULT '{}',
  price_sensitivity FLOAT DEFAULT 0.5,
  distance_preference FLOAT DEFAULT 5.0,
  social_influence FLOAT DEFAULT 0.5,
  spontaneity FLOAT DEFAULT 0.5,
  discovery_rate FLOAT DEFAULT 0.5,
  
  -- Métriques comportementales
  avg_decision_time INTEGER,
  like_rate FLOAT,
  total_interactions INTEGER DEFAULT 0,
  preferred_times INTEGER[] DEFAULT '{}',
  preferred_days TEXT[] DEFAULT '{}',
  
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE event_interactions - Tracking détaillé des interactions
CREATE TABLE public.event_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID, -- Pas de FK pour garder l'historique même si event supprimé
  session_id TEXT NOT NULL,
  
  action TEXT NOT NULL CHECK (action IN ('view', 'like', 'dislike', 'participate', 'share', 'skip')),
  duration_ms INTEGER,
  signal_interpretation TEXT,
  
  position_in_session INTEGER,
  device_type TEXT,
  event_snapshot JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE recommendation_results - Logs des feeds générés
CREATE TABLE public.recommendation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  
  generation_context JSONB,
  recommended_events JSONB,
  
  generation_time_ms INTEGER,
  total_events_scored INTEGER,
  algorithm_version TEXT DEFAULT 'v2.0',
  
  events_liked UUID[],
  events_participated UUID[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE user_preference_cache - Cache pour performance
CREATE TABLE public.user_preference_cache (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  event_scores JSONB,
  friend_events UUID[],
  category_affinity JSONB,
  
  valid_until TIMESTAMPTZ,
  calculation_version TEXT,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preference_cache ENABLE ROW LEVEL SECURITY;

-- user_preferences: chaque user gère ses propres préférences
CREATE POLICY "Users can manage their own preferences"
ON public.user_preferences FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- event_interactions: chaque user voit/crée ses propres interactions
CREATE POLICY "Users can manage their own interactions"
ON public.event_interactions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- recommendation_results: chaque user voit ses propres résultats
CREATE POLICY "Users can view their own recommendations"
ON public.recommendation_results FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- user_preference_cache: lecture seule pour le user
CREATE POLICY "Users can read their own cache"
ON public.user_preference_cache FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can manage cache"
ON public.user_preference_cache FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- INDEXES POUR PERFORMANCE
-- =============================================

CREATE INDEX idx_interactions_user_session ON public.event_interactions(user_id, session_id);
CREATE INDEX idx_interactions_created ON public.event_interactions(created_at DESC);
CREATE INDEX idx_interactions_event ON public.event_interactions(event_id);
CREATE INDEX idx_interactions_action ON public.event_interactions(action);
CREATE INDEX idx_cache_valid ON public.user_preference_cache(valid_until);
CREATE INDEX idx_reco_session ON public.recommendation_results(session_id);
CREATE INDEX idx_reco_created ON public.recommendation_results(created_at DESC);
CREATE INDEX idx_preferences_onboarding ON public.user_preferences(onboarding_completed);

-- =============================================
-- TRIGGERS POUR updated_at
-- =============================================

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preference_cache_updated_at
BEFORE UPDATE ON public.user_preference_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();