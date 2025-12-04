-- Supprimer la politique trop permissive
DROP POLICY IF EXISTS "Users can see participants" ON public.event_participants;

-- Nouvelle politique: les utilisateurs peuvent voir uniquement:
-- 1. Leur propre participation
-- 2. Les participants aux événements qu'ils possèdent (business)
-- 3. Les participants aux événements où ils participent aussi (social)
CREATE POLICY "Users can view relevant participants"
ON public.event_participants
FOR SELECT
TO authenticated
USING (
  -- Ma propre participation
  auth.uid() = user_id
  OR
  -- Je suis le créateur/propriétaire de l'événement
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_participants.event_id 
    AND (e.created_by = auth.uid() OR e.venue_id = auth.uid())
  )
  OR
  -- Je participe aussi à cet événement (voir mes co-participants)
  EXISTS (
    SELECT 1 FROM event_participants ep2 
    WHERE ep2.event_id = event_participants.event_id 
    AND ep2.user_id = auth.uid()
  )
);