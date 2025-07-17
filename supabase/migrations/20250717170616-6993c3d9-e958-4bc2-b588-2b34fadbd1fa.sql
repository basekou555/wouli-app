-- Phase 1: Base de données simplifiée - Nettoyer et recréer proprement

-- Supprimer les anciennes tables et fonctions
DROP TABLE IF EXISTS public.event_likes CASCADE;
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP FUNCTION IF EXISTS public.update_event_counters() CASCADE;

-- Recréer event_likes avec contraintes propres
CREATE TABLE public.event_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_event_like UNIQUE(event_id, user_id)
);

-- Recréer event_participants avec contraintes propres
CREATE TABLE public.event_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'interested')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_event_participation UNIQUE(event_id, user_id)
);

-- Activer RLS
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simplifiées
CREATE POLICY "Public can view likes" ON public.event_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.event_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.event_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view participants" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can participate" ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel participation" ON public.event_participants FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement les compteurs
CREATE OR REPLACE FUNCTION public.update_event_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'event_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      UPDATE business_events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      UPDATE business_events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      RETURN OLD;
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'event_participants' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      UPDATE business_events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      UPDATE business_events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les triggers automatiques
CREATE TRIGGER event_likes_counter_trigger
  AFTER INSERT OR DELETE ON event_likes
  FOR EACH ROW EXECUTE FUNCTION update_event_counters();

CREATE TRIGGER event_participants_counter_trigger
  AFTER INSERT OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION update_event_counters();