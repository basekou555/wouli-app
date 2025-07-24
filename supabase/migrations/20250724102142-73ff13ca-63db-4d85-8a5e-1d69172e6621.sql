-- Corriger les profils existants qui ont été mal créés comme 'user' au lieu de 'business'
-- On identifie les utilisateurs business par leurs business_configs
UPDATE public.profiles 
SET type = 'business'::user_type
WHERE id IN (
  SELECT DISTINCT user_id 
  FROM public.business_configs
) AND type = 'user';