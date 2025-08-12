-- Analytics Snapshots Table for Business Analytics
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT CHECK (entity_type IN ('event', 'establishment')),
  entity_id UUID NOT NULL,
  period_type TEXT CHECK (period_type IN ('daily')), -- Start with daily only
  metrics JSONB NOT NULL,
  benchmark JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Business users can manage their analytics snapshots"
ON public.analytics_snapshots
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.business_events be 
    WHERE be.id = entity_id 
    AND be.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.business_configs bc 
    WHERE bc.user_id = auth.uid() 
    AND entity_type = 'establishment'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.business_events be 
    WHERE be.id = entity_id 
    AND be.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.business_configs bc 
    WHERE bc.user_id = auth.uid() 
    AND entity_type = 'establishment'
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_analytics_entity 
ON public.analytics_snapshots (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_analytics_period 
ON public.analytics_snapshots (period_type, created_at);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
ON public.analytics_snapshots (created_at DESC);

-- Add analytics columns to business_events
ALTER TABLE public.business_events 
ADD COLUMN IF NOT EXISTS performance_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_rank INTEGER,
ADD COLUMN IF NOT EXISTS peak_views_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS avg_booking_advance INTEGER,
ADD COLUMN IF NOT EXISTS last_minute_ratio DECIMAL,
ADD COLUMN IF NOT EXISTS actual_participants INTEGER,
ADD COLUMN IF NOT EXISTS no_show_rate DECIMAL;