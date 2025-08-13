-- Remove the potentially problematic view completely
DROP VIEW IF EXISTS public.business_profiles_public CASCADE;

-- The view is not needed since we've already implemented proper RLS policies
-- and field restrictions in the application code

-- Verify that our RLS policies are working correctly by checking them
-- This query is just for verification - no changes needed
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;