-- Mettre à jour le trigger pour inclure instagram_handle dans business_details
CREATE OR REPLACE FUNCTION public.create_business_details_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.type = 'business' THEN
    INSERT INTO business_details (id, venue_name, instagram_handle)
    VALUES (
      NEW.id, 
      NEW.username,
      -- Récupérer l'instagram_handle depuis les métadonnées du user
      (SELECT raw_user_meta_data->>'instagramHandle' FROM auth.users WHERE id = NEW.id)
    )
    ON CONFLICT (id) DO UPDATE SET
      instagram_handle = EXCLUDED.instagram_handle
    WHERE business_details.instagram_handle IS NULL;
  END IF;
  RETURN NEW;
END;
$$;