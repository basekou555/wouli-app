-- Ensure unique constraint and performance indexes for event_views
-- We do NOT recreate the table since it already exists in this project

-- Unique pair to support upsert without duplicates
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_views_user_event
ON public.event_views (user_id, event_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_event_views_user
ON public.event_views (user_id);

CREATE INDEX IF NOT EXISTS idx_event_views_viewed_at
ON public.event_views (viewed_at);
