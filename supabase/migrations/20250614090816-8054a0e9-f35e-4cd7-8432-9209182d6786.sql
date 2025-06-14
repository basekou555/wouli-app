
-- Create business_configs table
CREATE TABLE public.business_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  client_name TEXT NOT NULL,
  client_type TEXT NOT NULL,
  location TEXT NOT NULL,
  brand_color TEXT NOT NULL DEFAULT '#FF7A1F',
  features TEXT[] NOT NULL DEFAULT ARRAY['events', 'stats', 'redirections'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_events table
CREATE TABLE public.business_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue TEXT NOT NULL,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  price TEXT,
  image_url TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  participants INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.business_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_configs
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

-- RLS policies for business_events
CREATE POLICY "Users can view their own business events" 
  ON public.business_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

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
