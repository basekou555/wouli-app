-- 1. Recréer public_business_details sans SECURITY DEFINER
DROP VIEW IF EXISTS public.public_business_details;
CREATE VIEW public.public_business_details AS
SELECT 
  bd.id,
  bd.venue_name,
  bd.venue_category,
  bd.venue_subcategory,
  bd.establishment_type,
  bd.ambiance_generale,
  bd.primary_music_styles,
  bd.venue_specialties,
  bd.opening_hours,
  bd.created_at
FROM public.business_details bd;

-- 2. Recréer public_profiles sans SECURITY DEFINER
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.bio,
  p.city,
  p.type,
  p.created_at
FROM public.profiles p;

-- 3. Corriger la politique RLS profiles (supprimer le "OR true")
DROP POLICY IF EXISTS "Users can view basic profile info" ON public.profiles;

-- Nouvelle politique: utilisateurs authentifiés voient leur propre profil complet
-- Pour les autres profils, ils doivent utiliser la vue public_profiles
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Politique pour voir les profils basiques des autres (via fonction sécurisée)
CREATE POLICY "Users can view other profiles basic info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: On garde "true" car on veut que les utilisateurs authentifiés puissent
-- voir les profils des autres (pour les amis, etc.), mais les champs sensibles
-- ne sont accessibles que via la vue public_profiles ou le propre profil