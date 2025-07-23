
-- Phase 1: Migration critique - Fusion des tables events et corrections sécurité

-- 1. Créer une nouvelle table events unifiée avec le bon schéma
DROP TABLE IF EXISTS public.events_new CASCADE;

CREATE TABLE public.events_new (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time time,
  location text NOT NULL,
  venue text,
  category event_category NOT NULL,
  event_type text,
  price text,
  image_url text,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  participants integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  created_by_type text NOT NULL DEFAULT 'user' CHECK (created_by_type IN ('user', 'business')),
  end_date timestamp with time zone,
  max_participants integer,
  address text,
  tags text[],
  external_url text,
  search_appearances integer DEFAULT 0
);

-- 2. Migrer les données de business_events vers la nouvelle table
INSERT INTO public.events_new (
  id, title, description, date, time, location, venue, category, event_type, 
  price, image_url, views, likes, participants, created_at, updated_at, 
  created_by, created_by_type, external_url
)
SELECT 
  id, title, description, date, time, 
  COALESCE(custom_venue, venue, 'Lieu non spécifié') as location,
  venue, 
  category::event_category, 
  event_type, 
  price, 
  image_url, 
  views, 
  likes, 
  participants, 
  created_at, 
  updated_at, 
  user_id as created_by,
  'business' as created_by_type,
  external_url
FROM public.business_events;

-- 3. Migrer les données de l'ancienne table events (si elle existe et a des données)
INSERT INTO public.events_new (
  title, description, date, location, category, image_url, views, likes, 
  participants, created_at, updated_at, created_by, created_by_type, 
  end_date, max_participants, address, tags, external_url, search_appearances
)
SELECT 
  title, description, 
  date::date as date,
  location, 
  category, 
  image_url, 
  COALESCE(views, 0), 
  COALESCE(likes, 0), 
  COALESCE(participants, 0), 
  created_at, 
  updated_at, 
  created_by,
  CASE 
    WHEN created_by_type::text = 'business' THEN 'business'
    ELSE 'user'
  END as created_by_type,
  end_date, 
  max_participants, 
  address, 
  tags, 
  external_url,
  COALESCE(search_appearances, 0)
FROM public.events
WHERE EXISTS (SELECT 1 FROM public.events LIMIT 1);

-- 4. Sauvegarder les anciennes tables et remplacer
DROP TABLE IF EXISTS public.events_backup CASCADE;
DROP TABLE IF EXISTS public.business_events_backup CASCADE;

-- Sauvegarder les anciennes tables
ALTER TABLE public.events RENAME TO events_backup;
ALTER TABLE public.business_events RENAME TO business_events_backup;

-- Renommer la nouvelle table
ALTER TABLE public.events_new RENAME TO events;

-- 5. Recréer les politiques RLS sur la nouvelle table events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Politique pour voir tous les événements (publique)
CREATE POLICY "Public can view all events" 
  ON public.events 
  FOR SELECT 
  USING (true);

-- Politique pour que les créateurs puissent gérer leurs événements
CREATE POLICY "Event creators can manage their events" 
  ON public.events 
  FOR ALL 
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- 6. Mettre à jour les fonctions pour utiliser la table unifiée
CREATE OR REPLACE FUNCTION public.update_event_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'event_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      RETURN OLD;
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'event_participants' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Mise à jour de la fonction increment_event_views pour la table unifiée
CREATE OR REPLACE FUNCTION public.increment_event_views(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
    UPDATE events SET views = COALESCE(views, 0) + 1 WHERE id = event_id;
END;
$$;

-- 7. Correction des fonctions avec problèmes de sécurité (search_path)
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid uuid)
RETURNS TABLE(
  events_liked integer,
  events_participated integer,
  events_created integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM event_likes el WHERE el.user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM event_participants ep WHERE ep.user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM events WHERE created_by = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 8. Supprimer les anciennes fonctions qui ne sont plus nécessaires
DROP FUNCTION IF EXISTS public.increment_event_likes_counter(uuid, text);
DROP FUNCTION IF EXISTS public.increment_event_participants_counter(uuid, text);

-- 9. Recréer les triggers sur les tables d'interaction
DROP TRIGGER IF EXISTS event_likes_counter_trigger ON event_likes;
DROP TRIGGER IF EXISTS event_participants_counter_trigger ON event_participants;

CREATE TRIGGER event_likes_counter_trigger
  AFTER INSERT OR DELETE ON event_likes
  FOR EACH ROW EXECUTE FUNCTION update_event_counters();

CREATE TRIGGER event_participants_counter_trigger
  AFTER INSERT OR DELETE ON event_participants
  FOR EACH ROW EXECUTE FUNCTION update_event_counters();

-- 10. Mise à jour finale des compteurs pour s'assurer qu'ils sont corrects
UPDATE events SET 
  likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = events.id),
  participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = events.id);
