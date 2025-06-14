
-- Corriger les politiques RLS pour event_likes
DROP POLICY IF EXISTS "Users can like events" ON public.event_likes;
CREATE POLICY "Users can like events" 
  ON public.event_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Corriger les politiques RLS pour event_participants
DROP POLICY IF EXISTS "Users can participate in events" ON public.event_participants;
CREATE POLICY "Users can participate in events" 
  ON public.event_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- S'assurer que les fonctions RPC fonctionnent correctement
-- Vérifier que les fonctions increment_event_likes_counter et increment_event_participants_counter existent
-- et qu'elles gèrent bien les deux tables (events et business_events)

-- Mettre à jour la fonction pour gérer les erreurs et s'assurer qu'elle fonctionne
CREATE OR REPLACE FUNCTION public.increment_event_likes_counter(event_id uuid, table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF table_name = 'events' THEN
    UPDATE events SET likes = COALESCE(likes, 0) + 1 WHERE id = event_id;
  ELSIF table_name = 'business_events' THEN
    UPDATE business_events SET likes = COALESCE(likes, 0) + 1 WHERE id = event_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas faire échouer la transaction
    RAISE NOTICE 'Erreur lors de la mise à jour des likes: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_event_participants_counter(event_id uuid, table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF table_name = 'events' THEN
    UPDATE events SET participants = COALESCE(participants, 0) + 1 WHERE id = event_id;
  ELSIF table_name = 'business_events' THEN
    UPDATE business_events SET participants = COALESCE(participants, 0) + 1 WHERE id = event_id;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne pas faire échouer la transaction
    RAISE NOTICE 'Erreur lors de la mise à jour des participants: %', SQLERRM;
END;
$$;
