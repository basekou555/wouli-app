
-- Étape 1: Nettoyer définitivement les politiques RLS en conflit sur la table events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

-- Recréer des politiques RLS cohérentes pour la table events
CREATE POLICY "Events are viewable by everyone" 
  ON public.events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" 
  ON public.events 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" 
  ON public.events 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- S'assurer que les tables d'interaction ont RLS activé
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Nettoyer et recréer les politiques pour event_likes
DROP POLICY IF EXISTS "Event likes are viewable by everyone" ON public.event_likes;
DROP POLICY IF EXISTS "Users can like events" ON public.event_likes;
DROP POLICY IF EXISTS "Users can unlike events" ON public.event_likes;

CREATE POLICY "Event likes are viewable by everyone" 
  ON public.event_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can like events" 
  ON public.event_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike events" 
  ON public.event_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Nettoyer et recréer les politiques pour event_participants
DROP POLICY IF EXISTS "Event participants are viewable by everyone" ON public.event_participants;
DROP POLICY IF EXISTS "Users can participate in events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON public.event_participants;
DROP POLICY IF EXISTS "Users can cancel their participation" ON public.event_participants;

CREATE POLICY "Event participants are viewable by everyone" 
  ON public.event_participants 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can participate in events" 
  ON public.event_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" 
  ON public.event_participants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their participation" 
  ON public.event_participants 
  FOR DELETE 
  USING (auth.uid() = user_id);
