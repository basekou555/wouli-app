-- Fix the SECURITY DEFINER view issue by recreating the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.public_events;

-- Create a standard view (not SECURITY DEFINER) for public event listings
CREATE VIEW public.public_events AS
SELECT 
  be.id,
  be.title,
  be.description,
  be.venue,
  be.custom_venue,
  be.category,
  be.event_type,
  be.price,
  be.date,
  be.time,
  be.image_url,
  be.venue_photo_url,
  be.ambiance_photo_url,
  be.capacity,
  be.is_recurring,
  -- Only show aggregated counts, not sensitive business metrics
  be.likes,
  be.participants,
  be.views
FROM public.business_events be
WHERE be.date >= CURRENT_DATE;

-- Grant access to the view
GRANT SELECT ON public.public_events TO anon, authenticated;

-- Create RLS policy for the view to ensure proper security
ALTER VIEW public.public_events SET (security_barrier = true);

-- Also ensure the business_events table has proper RLS enabled for the view to work securely
-- Add a policy that allows public read access only to future events (for the view)
CREATE POLICY "Public can view future business events for listing" 
ON public.business_events 
FOR SELECT 
USING (date >= CURRENT_DATE);