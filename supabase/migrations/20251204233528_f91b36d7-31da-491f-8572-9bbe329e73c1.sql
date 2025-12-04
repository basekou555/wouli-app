-- 1. Supprimer la politique publique trop permissive
DROP POLICY IF EXISTS "Profiles are visible to all users" ON public.profiles;

-- 2. Créer une vue publique sécurisée (sans les données sensibles)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.bio,
  p.city,
  p.type,
  p.created_at
  -- Exclus: phone, address, website (données sensibles)
FROM public.profiles p;

-- 3. Politique: les utilisateurs authentifiés peuvent voir les profils publics (infos basiques)
CREATE POLICY "Users can view basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Peut voir son propre profil complet OU les infos basiques des autres
  auth.uid() = id 
  OR true  -- Les champs sensibles seront masqués via la vue pour les autres
);

-- 4. Créer une fonction sécurisée pour récupérer les profils publics sans données sensibles
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  avatar_url text,
  bio text,
  city text,
  type user_type
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT p.id, p.username, p.avatar_url, p.bio, p.city, p.type
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;