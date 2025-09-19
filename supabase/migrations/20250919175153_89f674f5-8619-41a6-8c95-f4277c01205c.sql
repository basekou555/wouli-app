-- Supprimer les anciennes politiques restrictives sur profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;

-- Créer une politique permettant à tous de voir les profils
CREATE POLICY "Profiles are visible to all users"
ON profiles FOR SELECT
USING (true);

-- Vérifier et corriger les politiques sur friendships
-- Note: Je vois que la table utilise user_id/friend_id, pas sender_id/receiver_id
-- Je vais adapter selon la structure actuelle

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can create friendship requests" ON friendships;
DROP POLICY IF EXISTS "Users can view their friendships" ON friendships;
DROP POLICY IF EXISTS "Users can update their friendships" ON friendships;

-- Créer les nouvelles politiques pour friendships
CREATE POLICY "Users can send friend requests"
ON friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their friendships"
ON friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can update received requests"
ON friendships FOR UPDATE
USING (auth.uid() = friend_id);

-- Corriger les politiques sur event_participants pour permettre la visibilité sociale
DROP POLICY IF EXISTS "Users can view their own participation" ON event_participants;
DROP POLICY IF EXISTS "Business owners can view participants in their events" ON event_participants;

-- Recréer avec une politique plus ouverte pour la lecture
CREATE POLICY "Users can see participants"
ON event_participants FOR SELECT
USING (true);

-- Maintenir les politiques d'écriture existantes
CREATE POLICY "Users can manage their own participation"
ON event_participants FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Permettre aux business de voir les participants à leurs événements
CREATE POLICY "Business owners can view participants in their events"
ON event_participants FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_events be 
  WHERE be.id = event_participants.event_id 
  AND be.user_id = auth.uid()
));

-- Même chose pour event_likes pour la cohérence
DROP POLICY IF EXISTS "Users can view their own likes" ON event_likes;
DROP POLICY IF EXISTS "Business owners can view likes on their events" ON event_likes;

CREATE POLICY "Users can see likes"
ON event_likes FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own likes"
ON event_likes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Business owners can view likes on their events"
ON event_likes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM business_events be 
  WHERE be.id = event_likes.event_id 
  AND be.user_id = auth.uid()
));