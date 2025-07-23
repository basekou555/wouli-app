-- Phase 1: Nettoyage de la base de données (approche corrigée)

-- 1. Supprimer toutes les business_configs orphelines et celle de Basek
DELETE FROM public.business_configs 
WHERE client_name IN ('Mon Établissement', 'Blue Note Bar', 'Club Nyx', 'FitMax Gym');

-- 2. Pour les profils demo, nous utiliserons des UUIDs existants ou nous les créerons via l'interface
-- Pour l'instant, supprimons juste les données incohérentes

-- 3. Nettoyer les données profiles demo existantes si elles existent
DELETE FROM public.profiles 
WHERE username IN ('blue_note_lyon', 'club_nyx_official', 'fitmax_gym_lyon');