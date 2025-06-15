
-- Phase 1: Critical RLS Policy Cleanup
-- Remove conflicting and duplicate policies, then recreate them with proper logic

-- First, drop all existing policies to clean up conflicts
DROP POLICY IF EXISTS "Business events are viewable by everyone" ON public.business_events;
DROP POLICY IF EXISTS "Users can view their own business events" ON public.business_events;
DROP POLICY IF EXISTS "Users can create their own business events" ON public.business_events;
DROP POLICY IF EXISTS "Users can update their own business events" ON public.business_events;
DROP POLICY IF EXISTS "Users can delete their own business events" ON public.business_events;

DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;

DROP POLICY IF EXISTS "Event likes are viewable by everyone" ON public.event_likes;
DROP POLICY IF EXISTS "Users can view all likes" ON public.event_likes;
DROP POLICY IF EXISTS "Users can like events" ON public.event_likes;
DROP POLICY IF EXISTS "Users can unlike events" ON public.event_likes;

DROP POLICY IF EXISTS "Event participants are viewable by everyone" ON public.event_participants;
DROP POLICY IF EXISTS "Users can view all participants" ON public.event_participants;
DROP POLICY IF EXISTS "Users can participate in events" ON public.event_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON public.event_participants;
DROP POLICY IF EXISTS "Users can cancel their participation" ON public.event_participants;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own business config" ON public.business_configs;
DROP POLICY IF EXISTS "Users can create their own business config" ON public.business_configs;
DROP POLICY IF EXISTS "Users can update their own business config" ON public.business_configs;

-- Now recreate policies with consistent and secure logic

-- Business Events Policies (Public read, owner write)
CREATE POLICY "Public can view business events" 
  ON public.business_events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Business owners can manage their events" 
  ON public.business_events 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Events Policies (Public read, creator write)
CREATE POLICY "Public can view events" 
  ON public.events 
  FOR SELECT 
  USING (true);

CREATE POLICY "Event creators can manage their events" 
  ON public.events 
  FOR ALL 
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Event Likes Policies
CREATE POLICY "Public can view event likes" 
  ON public.event_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage their likes" 
  ON public.event_likes 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Event Participants Policies
CREATE POLICY "Public can view event participants" 
  ON public.event_participants 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage their participation" 
  ON public.event_participants 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profiles Policies
CREATE POLICY "Public can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own profile" 
  ON public.profiles 
  FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Business Config Policies (Private to business owners)
CREATE POLICY "Business owners can manage their config" 
  ON public.business_configs 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin Events Import Policies (Restrict to business users)
DROP POLICY IF EXISTS "Only business users can view admin_events_import" ON public.admin_events_import;
DROP POLICY IF EXISTS "Only business users can insert admin_events_import" ON public.admin_events_import;
DROP POLICY IF EXISTS "Only business users can update admin_events_import" ON public.admin_events_import;
DROP POLICY IF EXISTS "Only business users can delete admin_events_import" ON public.admin_events_import;

-- Create a security definer function to check business user status
CREATE OR REPLACE FUNCTION public.is_business_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND type = 'business'
  );
$$;

CREATE POLICY "Business users can manage admin imports" 
  ON public.admin_events_import 
  FOR ALL 
  USING (public.is_business_user())
  WITH CHECK (public.is_business_user());
