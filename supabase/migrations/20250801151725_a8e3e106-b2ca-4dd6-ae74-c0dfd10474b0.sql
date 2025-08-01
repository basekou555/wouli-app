-- MIGRATION BACKEND SIMPLIFIÉE ET PROPRE

-- Étape 1: Supprimer les contraintes problématiques
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_created_by_fkey;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_price_check;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_date_check;

-- Étape 2: Adapter les structures
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS custom_venue TEXT;

ALTER TABLE public.events ALTER COLUMN price TYPE TEXT USING price::TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_type TEXT,
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Lyon',
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#FF7A1F',
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY['events', 'stats', 'redirections'];

-- Étape 3: Créer les profils business un par un pour éviter les conflits
DO $$
DECLARE
    config_record RECORD;
    event_record RECORD;
BEGIN
    -- D'abord traiter les business_configs
    FOR config_record IN SELECT * FROM public.business_configs LOOP
        INSERT INTO public.profiles (id, username, type, client_name, client_type, location, brand_color, features)
        VALUES (
            config_record.user_id,
            config_record.client_name || '_' || SUBSTRING(config_record.user_id::text, 1, 4),
            'business'::user_type,
            config_record.client_name,
            config_record.client_type,
            config_record.location,
            config_record.brand_color,
            config_record.features
        )
        ON CONFLICT (id) DO UPDATE SET
            client_name = EXCLUDED.client_name,
            client_type = EXCLUDED.client_type,
            location = EXCLUDED.location,
            brand_color = EXCLUDED.brand_color,
            features = EXCLUDED.features,
            updated_at = now()
        ON CONFLICT (username) DO NOTHING;
    END LOOP;

    -- Ensuite traiter les business_events sans config
    FOR event_record IN 
        SELECT DISTINCT be.user_id 
        FROM public.business_events be 
        WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = be.user_id)
    LOOP
        INSERT INTO public.profiles (id, username, type, client_name, client_type, location, brand_color, features)
        VALUES (
            event_record.user_id,
            'business_' || SUBSTRING(event_record.user_id::text, 1, 8),
            'business'::user_type,
            'Établissement Demo',
            'restaurant',
            'Lyon',
            '#FF7A1F',
            ARRAY['events', 'stats', 'redirections']
        )
        ON CONFLICT (id) DO NOTHING
        ON CONFLICT (username) DO NOTHING;
    END LOOP;
END $$;

-- Étape 4: Migrer les événements business
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
  CASE 
    WHEN be.category = 'bar' THEN 'a-boire'::event_category
    WHEN be.category = 'club' THEN 'soirees'::event_category
    WHEN be.category = 'sport' THEN 'activites'::event_category
    ELSE 'activites'::event_category
  END,
  (be.date || ' ' || be.time)::timestamptz,
  COALESCE(be.venue, be.custom_venue, 'Lieu non spécifié'),
  NULL,
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
WHERE NOT EXISTS (SELECT 1 FROM public.events e WHERE e.id = be.id);

-- Étape 5: Mise à jour des triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, type, client_name, client_type, location, brand_color, features)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'type', 'user')::user_type,
    CASE WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
         THEN COALESCE(new.raw_user_meta_data->>'clientName', 'Mon Établissement') ELSE NULL END,
    CASE WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
         THEN COALESCE(new.raw_user_meta_data->>'clientType', 'restaurant') ELSE NULL END,
    CASE WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
         THEN COALESCE(new.raw_user_meta_data->>'location', 'Lyon') ELSE 'Lyon' END,
    CASE WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
         THEN COALESCE(new.raw_user_meta_data->>'brandColor', '#FF7A1F') ELSE NULL END,
    CASE WHEN COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' 
         THEN ARRAY['events', 'stats', 'redirections'] ELSE NULL END
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_event_counters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'event_likes' THEN
    UPDATE events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)) 
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  ELSIF TG_TABLE_NAME = 'event_participants' THEN
    UPDATE events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)) 
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Étape 6: Nettoyage
DROP TABLE IF EXISTS public.business_events CASCADE;
DROP TABLE IF EXISTS public.business_configs CASCADE;
DROP TABLE IF EXISTS public.admin_events_import CASCADE;

-- Étape 7: Index et contraintes
CREATE INDEX IF NOT EXISTS idx_events_created_by_type ON public.events(created_by_type);
CREATE INDEX IF NOT EXISTS idx_events_category_date ON public.events(category, date);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON public.profiles(type);

-- Étape 8: Validation finale
DO $$
DECLARE
  events_count INTEGER;
  business_events_count INTEGER;
  user_events_count INTEGER;
  business_profiles_count INTEGER;
  total_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO events_count FROM public.events;
  SELECT COUNT(*) INTO business_events_count FROM public.events WHERE created_by_type = 'business';
  SELECT COUNT(*) INTO user_events_count FROM public.events WHERE created_by_type = 'user';
  SELECT COUNT(*) INTO business_profiles_count FROM public.profiles WHERE type = 'business';
  SELECT COUNT(*) INTO total_profiles FROM public.profiles;
  
  RAISE NOTICE '🎉 MIGRATION BACKEND WOULI TERMINÉE ! 🎉';
  RAISE NOTICE 'Événements: % total (% business, % user)', events_count, business_events_count, user_events_count;
  RAISE NOTICE 'Profils: % total (% business)', total_profiles, business_profiles_count;
  RAISE NOTICE '✅ Architecture unifiée prête pour production';
END $$;