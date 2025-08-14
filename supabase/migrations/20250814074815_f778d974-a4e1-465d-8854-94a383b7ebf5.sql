-- Check and fix any remaining SECURITY DEFINER issues
-- The linter is still detecting a SECURITY DEFINER view, let's investigate and fix

-- List all views to see what might be causing the issue
DO $$
DECLARE
    view_record RECORD;
BEGIN
    FOR view_record IN 
        SELECT schemaname, viewname, definition 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        RAISE NOTICE 'View: %.% - Definition: %', view_record.schemaname, view_record.viewname, view_record.definition;
    END LOOP;
END $$;

-- Remove any potential SECURITY DEFINER properties from existing functions
-- Let's recreate the get_public_business_info function without SECURITY DEFINER if needed
CREATE OR REPLACE FUNCTION public.get_public_business_info()
RETURNS TABLE(
  id uuid,
  username text,
  bio text,
  city text,
  avatar_url text
)
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.city,
    p.avatar_url
  FROM public.profiles p
  WHERE p.type = 'business'::user_type;
$function$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.get_public_business_info() TO anon, authenticated;