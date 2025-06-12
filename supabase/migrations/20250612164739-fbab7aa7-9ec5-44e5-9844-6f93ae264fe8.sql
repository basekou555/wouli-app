
-- Enable RLS on all tables if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for events table (public read access)
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" 
  ON public.events 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can create events" ON public.events;
CREATE POLICY "Users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
CREATE POLICY "Users can update their own events" 
  ON public.events 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Policies for event_likes table
DROP POLICY IF EXISTS "Users can view all likes" ON public.event_likes;
CREATE POLICY "Users can view all likes" 
  ON public.event_likes 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can like events" ON public.event_likes;
CREATE POLICY "Users can like events" 
  ON public.event_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike events" ON public.event_likes;
CREATE POLICY "Users can unlike events" 
  ON public.event_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for event_participants table
DROP POLICY IF EXISTS "Users can view all participants" ON public.event_participants;
CREATE POLICY "Users can view all participants" 
  ON public.event_participants 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can participate in events" ON public.event_participants;
CREATE POLICY "Users can participate in events" 
  ON public.event_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their participation" ON public.event_participants;
CREATE POLICY "Users can update their participation" 
  ON public.event_participants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can cancel their participation" ON public.event_participants;
CREATE POLICY "Users can cancel their participation" 
  ON public.event_participants 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Create trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
  events_liked INTEGER,
  events_participated INTEGER,
  events_created INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM event_likes WHERE user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM event_participants WHERE user_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM events WHERE created_by = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
