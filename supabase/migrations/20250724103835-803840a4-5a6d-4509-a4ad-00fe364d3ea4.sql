-- Phase 1: Corriger les profils existants qui ont été mal créés comme 'user' au lieu de 'business'
UPDATE public.profiles 
SET type = 'business'::user_type
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM public.business_configs
) AND type = 'user';

-- Phase 2: Corriger le trigger pour créer automatiquement la business_config
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Créer le profil utilisateur
  INSERT INTO public.profiles (id, username, type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'type', 'user')::user_type
  );
  
  -- Si c'est un utilisateur business, créer automatiquement la configuration
  IF COALESCE(new.raw_user_meta_data->>'type', 'user') = 'business' THEN
    INSERT INTO public.business_configs (
      user_id,
      client_name,
      client_type,
      location,
      brand_color,
      features
    ) VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'clientName', 'Mon Établissement'),
      COALESCE(new.raw_user_meta_data->>'clientType', 'restaurant'),
      COALESCE(new.raw_user_meta_data->>'location', 'Lyon'),
      COALESCE(new.raw_user_meta_data->>'brandColor', '#FF7A1F'),
      COALESCE(
        CASE 
          WHEN new.raw_user_meta_data->>'features' IS NOT NULL 
          THEN string_to_array(new.raw_user_meta_data->>'features', ',')
          ELSE ARRAY['events', 'stats', 'redirections']
        END,
        ARRAY['events', 'stats', 'redirections']
      )
    );
  END IF;
  
  RETURN new;
END;
$function$;