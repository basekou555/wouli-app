-- 1. Supprimer la politique publique trop permissive
DROP POLICY IF EXISTS "Anyone can view business details" ON public.business_details;

-- 2. Créer une vue publique sécurisée (sans les données sensibles)
CREATE OR REPLACE VIEW public.public_business_details AS
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
  -- Exclus: contact_email, contact_phone, verified, subscription_tier, instagram_handle, onboarding_completed
FROM public.business_details bd;

-- 3. Nouvelle politique: les utilisateurs authentifiés peuvent voir les infos publiques des business
CREATE POLICY "Authenticated users can view public business info"
ON public.business_details
FOR SELECT
TO authenticated
USING (true);

-- 4. Les infos publiques sont visibles via la vue, pas la table directe pour anon
-- La vue n'expose pas les champs sensibles

-- 5. Politique pour que le propriétaire garde l'accès complet (déjà existante mais on s'assure)
DROP POLICY IF EXISTS "Business can manage own details" ON public.business_details;
CREATE POLICY "Business can manage own details"
ON public.business_details
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);