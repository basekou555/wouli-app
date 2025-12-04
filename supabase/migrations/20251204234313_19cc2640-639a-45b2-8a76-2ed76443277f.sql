-- Supprimer la politique trop permissive
DROP POLICY IF EXISTS "Authenticated users can view public business info" ON public.business_details;

-- Seul le propriétaire peut voir ses propres détails complets (incluant contact_email, contact_phone)
-- Les autres utilisateurs doivent passer par la vue public_business_details (sans données sensibles)
CREATE POLICY "Business owners can view their own details"
ON public.business_details
FOR SELECT
TO authenticated
USING (auth.uid() = id);