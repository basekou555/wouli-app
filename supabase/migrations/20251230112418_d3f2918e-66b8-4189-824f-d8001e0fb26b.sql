-- 1. Supprimer la policy problématique avec auto-référence
DROP POLICY IF EXISTS "Users can view relevant participants" ON event_participants;

-- 2. Supprimer l'ancienne policy redondante avec ALL
DROP POLICY IF EXISTS "Users can manage their own participation" ON event_participants;

-- 3. Créer une policy SELECT simple pour ses propres participations
CREATE POLICY "Users can view their own participations"
ON event_participants FOR SELECT
USING (auth.uid() = user_id);

-- 4. Créer une policy pour les business owners (via events seulement, pas d'auto-référence)
CREATE POLICY "Business owners view event participants"
ON event_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_participants.event_id
    AND e.created_by = auth.uid()
  )
);

-- 5. Policy UPDATE pour modifier ses propres participations
CREATE POLICY "Users can update their participation"
ON event_participants FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);