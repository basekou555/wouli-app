-- =============================================
-- FONCTION: update_updated_at pour les triggers
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- TABLE: event_memories (Souvenirs utilisateurs)
-- =============================================
CREATE TABLE IF NOT EXISTS event_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  photo_url TEXT,
  note TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_event_memories_user_id ON event_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_event_memories_event_id ON event_memories(event_id);

-- RLS
ALTER TABLE event_memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own memories" ON event_memories;
CREATE POLICY "Users manage their own memories"
ON event_memories FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_event_memories_updated_at ON event_memories;
CREATE TRIGGER update_event_memories_updated_at
BEFORE UPDATE ON event_memories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TABLE: user_event_views (Tracking événements vus)
-- Simple tracking sans contrainte unique complexe
-- =============================================
CREATE TABLE IF NOT EXISTS user_event_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'app',
  view_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, event_id, view_date)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_user_event_views_user_id ON user_event_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_views_event_id ON user_event_views(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_views_viewed_at ON user_event_views(viewed_at DESC);

-- RLS
ALTER TABLE user_event_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see their own views" ON user_event_views;
CREATE POLICY "Users see their own views"
ON user_event_views FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert views" ON user_event_views;
CREATE POLICY "Users can insert views"
ON user_event_views FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STORAGE: Bucket event-memories
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-memories', 'event-memories', true)
ON CONFLICT (id) DO NOTHING;

-- Policies Storage
DROP POLICY IF EXISTS "Anyone can view memory photos" ON storage.objects;
CREATE POLICY "Anyone can view memory photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-memories');

DROP POLICY IF EXISTS "Users can upload their own memory photos" ON storage.objects;
CREATE POLICY "Users can upload their own memory photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-memories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own memory photos" ON storage.objects;
CREATE POLICY "Users can update their own memory photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-memories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own memory photos" ON storage.objects;
CREATE POLICY "Users can delete their own memory photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-memories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);