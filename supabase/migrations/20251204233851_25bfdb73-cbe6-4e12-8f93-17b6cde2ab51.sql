-- Corriger la politique RLS profiles - supprimer les politiques redondantes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles basic info" ON public.profiles;

-- Une seule politique pour les utilisateurs authentifiés (peuvent voir tous les profils)
-- Les données sensibles sont protégées via la vue public_profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);