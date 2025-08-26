
-- 1) Autoriser les admins à mettre à jour n'importe quel événement
-- (utile pour "revert to pending" et l'édition depuis l'UI admin)
CREATE POLICY "Admins can update any event"
ON public.events
FOR UPDATE
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- 2) Autoriser les admins à lire tous les profils (compter les utilisateurs)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin_user());

-- 3) Autoriser les admins à lire toutes les configurations établissement
-- (compter les établissements)
CREATE POLICY "Admins can view all business configs"
ON public.business_configs
FOR SELECT
USING (public.is_admin_user());
