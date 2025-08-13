-- Create a function to get safe public business info without exposing personal data
CREATE OR REPLACE FUNCTION public.get_public_business_info()
RETURNS TABLE(
  id uuid,
  username text,
  bio text,
  city text,
  avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- Grant access to this function for anonymous users
GRANT EXECUTE ON FUNCTION public.get_public_business_info() TO anon, authenticated;

-- Ensure RLS is properly configured - remove any remaining overly permissive policies
-- Keep the policies we created but verify they require authentication