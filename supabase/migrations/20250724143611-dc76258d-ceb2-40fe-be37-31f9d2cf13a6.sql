-- Étape 2: Corriger la configuration business avec les vraies données du profil
UPDATE public.business_configs 
SET 
  client_name = (
    SELECT username 
    FROM public.profiles 
    WHERE profiles.id = business_configs.user_id
  ),
  location = COALESCE(
    (SELECT city FROM public.profiles WHERE profiles.id = business_configs.user_id),
    'Lyon'
  ),
  updated_at = now()
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE type = 'business'
);