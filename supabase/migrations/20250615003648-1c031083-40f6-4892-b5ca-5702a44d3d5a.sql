
-- Enable Row Level Security on admin_events_import table
ALTER TABLE public.admin_events_import ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access to business users only
-- Since this is an admin table, restrict to business users who can manage events
CREATE POLICY "Only business users can view admin_events_import" 
  ON public.admin_events_import 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND type = 'business'
    )
  );

CREATE POLICY "Only business users can insert admin_events_import" 
  ON public.admin_events_import 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND type = 'business'
    )
  );

CREATE POLICY "Only business users can update admin_events_import" 
  ON public.admin_events_import 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND type = 'business'
    )
  );

CREATE POLICY "Only business users can delete admin_events_import" 
  ON public.admin_events_import 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND type = 'business'
    )
  );
