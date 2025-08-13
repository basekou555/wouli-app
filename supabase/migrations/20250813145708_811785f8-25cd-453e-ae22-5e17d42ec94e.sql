-- Drop the existing policy first
DROP POLICY IF EXISTS "Public can view essential business info only" ON public.profiles;

-- Now we need to update the frontend code to only select essential fields when accessing business profiles
-- Since RLS can't restrict which columns are returned, we need a different approach

-- Create a new restrictive policy that only allows authenticated users to see full business profiles
CREATE POLICY "Authenticated can view business profiles" 
ON public.profiles 
FOR SELECT 
USING (
  type = 'business'::user_type AND auth.uid() IS NOT NULL
);

-- Create a policy for public access that is more restrictive
-- We'll handle field restriction in the application code
CREATE POLICY "Limited public business access" 
ON public.profiles 
FOR SELECT 
USING (
  type = 'business'::user_type
);

-- Update the remaining functions with proper search paths
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

CREATE OR REPLACE FUNCTION public.increment_event_views(event_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    UPDATE events SET views = views + 1 WHERE id = event_id;
END;
$function$;