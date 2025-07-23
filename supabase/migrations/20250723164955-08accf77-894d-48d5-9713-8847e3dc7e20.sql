-- Phase 1: Nettoyage complet de la base de données

-- 1. Supprimer toutes les business_configs orphelines et celle de Basek
DELETE FROM public.business_configs 
WHERE client_name IN ('Mon Établissement', 'Blue Note Bar', 'Club Nyx', 'FitMax Gym');

-- 2. Créer 2-3 profils business demo pour le benchmark Lyon
-- Créer les profils dans la table profiles
INSERT INTO public.profiles (id, username, type, bio, city, website) VALUES
  (gen_random_uuid(), 'bistrot_lyon_bellecour', 'business', 'Bistrot traditionnel au cœur de Lyon. Spécialités lyonnaises et ambiance chaleureuse.', 'Lyon', 'www.bistrot-bellecour.fr'),
  (gen_random_uuid(), 'jazz_club_vieux_lyon', 'business', 'Club de jazz intimiste dans le Vieux Lyon. Concerts live et cave à vins d''exception.', 'Lyon', 'www.jazz-vieux-lyon.com');

-- 3. Créer les business_configs correspondantes
WITH new_profiles AS (
  SELECT id, username FROM public.profiles 
  WHERE username IN ('bistrot_lyon_bellecour', 'jazz_club_vieux_lyon')
)
INSERT INTO public.business_configs (user_id, client_name, client_type, location, brand_color, features)
SELECT 
  np.id,
  CASE 
    WHEN np.username = 'bistrot_lyon_bellecour' THEN 'Bistrot de Bellecour'
    WHEN np.username = 'jazz_club_vieux_lyon' THEN 'Jazz Club Vieux Lyon'
  END,
  CASE 
    WHEN np.username = 'bistrot_lyon_bellecour' THEN 'restaurant'
    WHEN np.username = 'jazz_club_vieux_lyon' THEN 'bar'
  END,
  'Lyon',
  CASE 
    WHEN np.username = 'bistrot_lyon_bellecour' THEN '#8B4513'
    WHEN np.username = 'jazz_club_vieux_lyon' THEN '#1E3A8A'
  END,
  ARRAY['events', 'stats', 'redirections']
FROM new_profiles np;