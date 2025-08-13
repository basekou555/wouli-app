-- Add archiving and rating system

-- 1. Add new columns to events table
ALTER TABLE public.events 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
ADD COLUMN duration_hours integer DEFAULT 4,
ADD COLUMN end_time timestamp with time zone,
ADD COLUMN average_rating numeric(3,2) DEFAULT 0;

-- 2. Add new columns to business_events table  
ALTER TABLE public.business_events
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
ADD COLUMN duration_hours integer DEFAULT 4,
ADD COLUMN end_time timestamp with time zone,
ADD COLUMN average_rating numeric(3,2) DEFAULT 0;

-- 3. Create event_ratings table
CREATE TABLE public.event_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  attended boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create unique constraint to prevent duplicate ratings
ALTER TABLE public.event_ratings 
ADD CONSTRAINT unique_user_event_rating UNIQUE (event_id, user_id);

-- Enable RLS on event_ratings
ALTER TABLE public.event_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_ratings
CREATE POLICY "Users can view all ratings" 
ON public.event_ratings FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own ratings" 
ON public.event_ratings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings within 24h" 
ON public.event_ratings FOR UPDATE 
USING (auth.uid() = user_id AND created_at > now() - interval '24 hours');

-- 4. Function to calculate end_time automatically
CREATE OR REPLACE FUNCTION public.calculate_end_time()
RETURNS trigger AS $$
BEGIN
  -- For events table
  IF TG_TABLE_NAME = 'events' THEN
    NEW.end_time := NEW.date + (NEW.duration_hours || ' hours')::interval;
  END IF;
  
  -- For business_events table
  IF TG_TABLE_NAME = 'business_events' THEN
    NEW.end_time := (NEW.date::text || ' ' || NEW.time::text)::timestamp + (NEW.duration_hours || ' hours')::interval;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Triggers for automatic end_time calculation
CREATE TRIGGER calculate_end_time_events
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.calculate_end_time();

CREATE TRIGGER calculate_end_time_business_events
  BEFORE INSERT OR UPDATE ON public.business_events
  FOR EACH ROW EXECUTE FUNCTION public.calculate_end_time();

-- 6. Function to update average rating
CREATE OR REPLACE FUNCTION public.update_average_rating()
RETURNS trigger AS $$
DECLARE
  event_avg numeric(3,2);
BEGIN
  -- Calculate new average rating for the event
  SELECT ROUND(AVG(rating::numeric), 2) INTO event_avg
  FROM public.event_ratings 
  WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
  AND attended = true; -- Only count ratings from people who actually attended
  
  -- Update both events and business_events tables
  UPDATE public.events 
  SET average_rating = COALESCE(event_avg, 0)
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  UPDATE public.business_events 
  SET average_rating = COALESCE(event_avg, 0)
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger for automatic average rating updates
CREATE TRIGGER update_average_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.event_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_average_rating();

-- 8. Function to archive expired events
CREATE OR REPLACE FUNCTION public.archive_expired_events()
RETURNS void AS $$
BEGIN
  -- Archive user events 2 hours after end_time
  UPDATE public.events
  SET status = 'archived'
  WHERE status = 'active' 
  AND end_time + interval '2 hours' < now();
  
  -- Archive business events 1 week after end_time  
  UPDATE public.business_events
  SET status = 'archived'
  WHERE status = 'active'
  AND end_time + interval '1 week' < now();
END;
$$ LANGUAGE plpgsql;

-- 9. Update existing events with calculated end_time
UPDATE public.events 
SET end_time = date + (duration_hours || ' hours')::interval
WHERE end_time IS NULL;

UPDATE public.business_events 
SET end_time = (date::text || ' ' || time::text)::timestamp + (duration_hours || ' hours')::interval
WHERE end_time IS NULL;