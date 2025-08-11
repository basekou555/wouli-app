-- Create event_views table for tracking viewed events
CREATE TABLE IF NOT EXISTS public.event_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_views_user_event_unique UNIQUE (user_id, event_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_views_user ON public.event_views(user_id);
CREATE INDEX IF NOT EXISTS idx_event_views_viewed_at ON public.event_views(viewed_at);

-- Enable Row Level Security
ALTER TABLE public.event_views ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own view records
DROP POLICY IF EXISTS "Users can view their own views" ON public.event_views;
DROP POLICY IF EXISTS "Users can insert their own views" ON public.event_views;
DROP POLICY IF EXISTS "Users can delete their own views" ON public.event_views;

CREATE POLICY "Users can view their own views"
ON public.event_views
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own views"
ON public.event_views
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own views"
ON public.event_views
FOR DELETE
USING (auth.uid() = user_id);

-- Extend business_events with new optional fields for richer previews
ALTER TABLE public.business_events
  ADD COLUMN IF NOT EXISTS venue_photo_url text,
  ADD COLUMN IF NOT EXISTS ambiance_photo_url text,
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avg_attendance integer,
  ADD COLUMN IF NOT EXISTS total_editions integer;