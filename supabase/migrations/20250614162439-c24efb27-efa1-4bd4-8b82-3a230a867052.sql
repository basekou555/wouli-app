
-- Add new columns to business_events table for ticketing link and flexible venue
ALTER TABLE business_events 
ADD COLUMN external_url text,
ADD COLUMN custom_venue text;

-- Update the venue column to allow null values for custom venues
ALTER TABLE business_events 
ALTER COLUMN venue DROP NOT NULL;
