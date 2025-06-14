
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Business events are viewable by everyone" ON public.business_events;
DROP POLICY IF EXISTS "Users can create their own business events" ON public.business_events;
DROP POLICY IF EXISTS "Users can update their own business events" ON public.business_events;
DROP POLICY IF EXISTS "Users can delete their own business events" ON public.business_events;

DROP POLICY IF EXISTS "Users can view their own business config" ON public.business_configs;
DROP POLICY IF EXISTS "Users can create their own business config" ON public.business_configs;
DROP POLICY IF EXISTS "Users can update their own business config" ON public.business_configs;

DROP POLICY IF EXISTS "Event likes are viewable by everyone" ON public.event_likes;
DROP POLICY IF EXISTS "Users can like events" ON public.event_likes;
DROP POLICY IF EXISTS "Users can unlike events" ON public.event_likes;

DROP POLICY IF EXISTS "Event participants are viewable by everyone" ON public.event_participants;
DROP POLICY IF EXISTS "Users can participate in events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON public.event_participants;
DROP POLICY IF EXISTS "Users can cancel their participation" ON public.event_participants;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Now create all policies
-- Enable RLS on business_events and business_configs if not already enabled
ALTER TABLE public.business_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_configs ENABLE ROW LEVEL SECURITY;

-- Public read access for business_events (for event discovery)
CREATE POLICY "Business events are viewable by everyone" 
  ON public.business_events 
  FOR SELECT 
  USING (true);

-- Business owners can manage their own events
CREATE POLICY "Users can create their own business events" 
  ON public.business_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business events" 
  ON public.business_events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business events" 
  ON public.business_events 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Business config policies (private to business owners)
CREATE POLICY "Users can view their own business config" 
  ON public.business_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business config" 
  ON public.business_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business config" 
  ON public.business_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Update existing events table policies for consistency
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" 
  ON public.events 
  FOR SELECT 
  USING (true);

-- Event interactions policies (likes and participants)
CREATE POLICY "Event likes are viewable by everyone" 
  ON public.event_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can like events" 
  ON public.event_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike events" 
  ON public.event_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Event participants are viewable by everyone" 
  ON public.event_participants 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can participate in events" 
  ON public.event_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" 
  ON public.event_participants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their participation" 
  ON public.event_participants 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Profile policies for public visibility
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
