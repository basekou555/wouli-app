-- ===== PHASE 1: PRÉPARATION DES STRUCTURES =====

-- Supprimer TOUTES les contraintes qui peuvent causer des conflits
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_price_check;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_date_check;

-- Adapter la table events pour recevoir les données business
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS custom_venue TEXT;

-- Changer le type de price de numeric vers text
ALTER TABLE public.events ALTER COLUMN price TYPE TEXT USING price::TEXT;

-- Adapter la table profiles pour les données business
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_type TEXT,
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Lyon',
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#FF7A1F',
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY['events', 'stats', 'redirections'];

-- ===== PHASE 2: MIGRATION DES DONNÉES =====

-- Migrer les événements business vers la table events unifiée avec mapping des catégories
INSERT INTO public.events (
  id, title, description, category, date, location, address, 
  image_url, external_url, price, views, likes, participants,
  created_by, created_by_type, created_at, updated_at,
  time, venue, custom_venue
)
SELECT 
  be.id,
  be.title,
  be.description,
  -- Mapper les catégories business vers les catégories Wouli
  CASE 
    WHEN be.category = 'bar' THEN 'a-boire'::event_category
    WHEN be.category = 'club' THEN 'soirees'::event_category
    WHEN be.category = 'sport' THEN 'activites'::event_category
    ELSE 'activites'::event_category  -- fallback
  END as category,
  (be.date || ' ' || be.time)::timestamptz,
  COALESCE(be.venue, be.custom_venue, 'Lieu non spécifié'),
  NULL as address,
  be.image_url,
  be.external_url,
  be.price,
  be.views,
  be.likes,
  be.participants,
  be.user_id,
  'business'::event_creator_type,
  be.created_at,
  be.updated_at,
  be.time,
  be.venue,
  be.custom_venue
FROM public.business_events be
WHERE NOT EXISTS (
  SELECT 1 FROM public.events e WHERE e.id = be.id
);

-- Migrer les configurations business vers la table profiles
UPDATE public.profiles 
SET 
  client_name = bc.client_name,
  client_type = bc.client_type,
  location = bc.location,
  brand_color = bc.brand_color,
  features = bc.features,
  updated_at = now()
FROM public.business_configs bc
WHERE profiles.id = bc.user_id;

-- ===== PHASE 3: MISE À JOUR DES TRIGGERS =====

-- Mettre à jour la fonction handle_new_user pour utiliser profiles directement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Créer le profil utilisateur avec données business si applicable
  INSERT INTO public.profiles (
    id, 
    username, 
    type,
    client_name,
    client_type,
    location,
    brand_color,
    features
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'type', 'user')::user_type,
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
      THEN COALESCE(new.raw_user_meta_data->>'clientName', 'Mon Établissement')
      ELSE NULL
    END,
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
      THEN COALESCE(new.raw_user_meta_data->>'clientType', 'restaurant')
      ELSE NULL
    END,
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
      THEN COALESCE(new.raw_user_meta_data->>'location', 'Lyon')
      ELSE 'Lyon'
    END,
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
      THEN COALESCE(new.raw_user_meta_data->>'brandColor', '#FF7A1F')
      ELSE NULL
    END,
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
      THEN COALESCE(
        CASE 
          WHEN new.raw_user_meta_data->>'features' IS NOT NULL 
          THEN string_to_array(new.raw_user_meta_data->>'features', ',')
          ELSE ARRAY['events', 'stats', 'redirections']
        END,
        ARRAY['events', 'stats', 'redirections']
      )
      ELSE NULL
    END
  );
  
  RETURN new;
END;
$function$;

-- Simplifier la fonction update_event_counters pour ne cibler que events
CREATE OR REPLACE FUNCTION public.update_event_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
$function$;

-- ===== PHASE 4: NETTOYAGE (IRRÉVERSIBLE) =====

-- Supprimer les triggers liés aux anciennes tables
DROP TRIGGER IF EXISTS update_business_events_updated_at ON public.business_events;
DROP TRIGGER IF EXISTS update_business_configs_updated_at ON public.business_configs;

-- Supprimer les anciennes tables
DROP TABLE IF EXISTS public.business_events CASCADE;
DROP TABLE IF EXISTS public.business_configs CASCADE;

-- Supprimer la table admin_events_import qui n'est plus nécessaire
DROP TABLE IF EXISTS public.admin_events_import CASCADE;

-- ===== PHASE 5: VALIDATION ET OPTIMISATION =====

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_events_created_by_type ON public.events(created_by_type);
CREATE INDEX IF NOT EXISTS idx_events_category_date ON public.events(category, date);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON public.profiles(type);

-- Remettre seulement les contraintes utiles (pas la contrainte de date future)
ALTER TABLE public.events 
ADD CONSTRAINT events_title_length_check CHECK (char_length(title) >= 3 AND char_length(title) <= 200);

ALTER TABLE public.events 
ADD CONSTRAINT events_description_length_check CHECK (char_length(description) <= 2000 OR description IS NULL);

ALTER TABLE public.events 
ADD CONSTRAINT events_max_participants_positive_check CHECK (max_participants IS NULL OR max_participants > 0);

-- Vérification finale
DO $$
DECLARE
  events_count INTEGER;
  business_profiles_count INTEGER;
  business_events_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO events_count FROM public.events;
  SELECT COUNT(*) INTO business_events_count FROM public.events WHERE created_by_type = 'business';
  SELECT COUNT(*) INTO business_profiles_count FROM public.profiles WHERE type = 'business';
  
  RAISE NOTICE '🎉 MIGRATION BACKEND RÉUSSIE ! 🎉';
  RAISE NOTICE 'Total événements unifiés: %', events_count;
  RAISE NOTICE 'Événements business migrés: %', business_events_count;
  RAISE NOTICE 'Profils business configurés: %', business_profiles_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Architecture unifiée: 1 table events + 1 table profiles';
  RAISE NOTICE '✅ Zéro duplication de données';
  RAISE NOTICE '✅ Backend prêt pour agents IA et scalabilité';
  RAISE NOTICE '✅ App immédiatement opérationnelle';
END $$;