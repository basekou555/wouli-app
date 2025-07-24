-- Phase 1: Nettoyage complet et préparation
DELETE FROM public.business_configs WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Phase 2: Création directe des profils business avec UUID fixes
-- (Ces UUIDs seront utilisés via /business/signup pour créer les vrais comptes)

-- Générer des UUIDs fixes pour les établissements
INSERT INTO public.profiles (id, username, type, bio, city, website) VALUES
-- 1. BRUME RESTAURANT
('11111111-1111-1111-1111-111111111111', 'brume_lyon', 'business', 'Brume Lyon - Restaurant festif', 'Lyon', 'www.brume-lyon.wouli-demo.fr'),
-- 2. LE SIX
('22222222-2222-2222-2222-222222222222', 'le_six_lyon', 'business', 'Le Six Lyon - Restaurant festif / Bar-restaurant', 'Lyon', 'www.le-six-lyon.wouli-demo.fr'),
-- 3. LA FERIA
('33333333-3333-3333-3333-333333333333', 'la_feria_lyon', 'business', 'La Feria Lyon - Bar à tapas / Club Latino', 'Lyon', 'www.la-feria-lyon.wouli-demo.fr'),
-- 4. DOCKS 40
('44444444-4444-4444-4444-444444444444', 'docks_40_lyon', 'business', 'Docks 40 Lyon - Bar-restaurant avec programmation musicale', 'Lyon', 'www.docks-40-lyon.wouli-demo.fr'),
-- 5. LE SUCRE
('55555555-5555-5555-5555-555555555555', 'le_sucre_lyon', 'business', 'Le Sucre Lyon - Club / Lieu culturel rooftop', 'Lyon', 'www.le-sucre-lyon.wouli-demo.fr'),
-- 6. LES SALONS DU NH
('66666666-6666-6666-6666-666666666666', 'salons_du_nh', 'business', 'Les Salons du NH - Club Hip-Hop/Afro/Caribéen', 'Lyon', 'www.salons-du-nh.wouli-demo.fr'),
-- 7. L'HACHEZ-VOUS
('77777777-7777-7777-7777-777777777777', 'hachez_vous_lyon', 'business', 'L''Hachez-Vous Lyon - Lancer de hache / Activité insolite', 'Lyon', 'www.hachez-vous-lyon.wouli-demo.fr'),
-- 8. MUSÉE DE L'ILLUSION
('88888888-8888-8888-8888-888888888888', 'musee_illusion_lyon', 'business', 'Musée de l''Illusion Lyon - Musée interactif / Activité culturelle', 'Lyon', 'www.musee-illusion-lyon.wouli-demo.fr')
ON CONFLICT (id) DO NOTHING;

-- Phase 3: Création des configurations business
INSERT INTO public.business_configs (user_id, client_name, client_type, location, brand_color, features) VALUES
-- 1. BRUME RESTAURANT
('11111111-1111-1111-1111-111111111111', 'Brume Lyon', 'Restaurant festif', 'Rue de la Bourse, 69002 Lyon', '#E67E22', ARRAY['events', 'stats', 'redirections', 'reservations']),
-- 2. LE SIX
('22222222-2222-2222-2222-222222222222', 'Le Six Lyon', 'Restaurant festif / Bar-restaurant', '13 Place Jules Ferry, 69006 Lyon', '#9B59B6', ARRAY['events', 'stats', 'redirections', 'clubbing']),
-- 3. LA FERIA
('33333333-3333-3333-3333-333333333333', 'La Feria Lyon', 'Bar à tapas / Club Latino', '13 Quai Romain Rolland, 69005 Lyon', '#E74C3C', ARRAY['events', 'stats', 'redirections', 'concerts']),
-- 4. DOCKS 40
('44444444-4444-4444-4444-444444444444', 'Docks 40 Lyon', 'Bar-restaurant avec programmation musicale', 'Quais de Saône, 69009 Lyon', '#3498DB', ARRAY['events', 'stats', 'redirections', 'programmation']),
-- 5. LE SUCRE
('55555555-5555-5555-5555-555555555555', 'Le Sucre Lyon', 'Club / Lieu culturel rooftop', '50 Quai Rambaud, 69002 Lyon', '#F39C12', ARRAY['events', 'stats', 'redirections', 'rooftop', 'culturel']),
-- 6. LES SALONS DU NH
('66666666-6666-6666-6666-666666666666', 'Les Salons du NH', 'Club Hip-Hop/Afro/Caribéen', '6 Rue Henri Barbusse, 69008 Lyon', '#8E44AD', ARRAY['events', 'stats', 'redirections', 'urbain']),
-- 7. L'HACHEZ-VOUS
('77777777-7777-7777-7777-777777777777', 'L''Hachez-Vous Lyon', 'Lancer de hache / Activité insolite', '4 Rue de l''Épée, 69003 Lyon', '#27AE60', ARRAY['events', 'stats', 'redirections', 'team-building']),
-- 8. MUSÉE DE L'ILLUSION
('88888888-8888-8888-8888-888888888888', 'Musée de l''Illusion Lyon', 'Musée interactif / Activité culturelle', 'Grand Hôtel-Dieu, 69002 Lyon', '#16A085', ARRAY['events', 'stats', 'redirections', 'famille', 'educatif'])
ON CONFLICT (user_id) DO UPDATE SET
  client_name = EXCLUDED.client_name,
  client_type = EXCLUDED.client_type,
  location = EXCLUDED.location,
  brand_color = EXCLUDED.brand_color,
  features = EXCLUDED.features;

-- Phase 4: Création d'événements démo pour chaque établissement

-- Événements BRUME RESTAURANT (catégorie: a-manger)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
) VALUES
('11111111-1111-1111-1111-111111111111', 'Dîner Franco-Asiatique', 'Menu fusion créatif avec accords vins. Cuisine raffinée mêlant traditions françaises et saveurs asiatiques.', CURRENT_DATE + 2, '19:30:00', 'Brume Lyon', 'a-manger', 'À manger', '45€', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
('11111111-1111-1111-1111-111111111111', 'Soirée Cocktails & Dim Sum', 'Découverte de nos dim sum maison accompagnés de cocktails signatures dans la salle Chartreuse.', CURRENT_DATE + 5, '18:00:00', 'Brume Lyon', 'a-boire', 'À boire', '32€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
('11111111-1111-1111-1111-111111111111', 'Brunch Festif Weekend', 'Brunch franco-asiatique avec DJ set ambient. Ambiance décontractée pour commencer le weekend.', CURRENT_DATE + 9, '11:00:00', 'Brume Lyon', 'a-manger', 'À manger', '28€', 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop'),
('11111111-1111-1111-1111-111111111111', 'Masterclass Cuisine Fusion', 'Atelier culinaire avec notre chef. Apprenez les secrets de la cuisine franco-asiatique.', CURRENT_DATE + 12, '14:00:00', 'Brume Lyon', 'a-manger', 'À manger', '65€', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
('11111111-1111-1111-1111-111111111111', 'Soirée Privée Chartreuse', 'Privatisation de notre salle Chartreuse pour une soirée exclusive. Ambiance festive garantie.', CURRENT_DATE + 16, '20:00:00', 'Brume Lyon', 'soirees', 'Soirées', '80€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),

-- Événements LE SIX (catégorie mixte: a-manger + soirees)
('22222222-2222-2222-2222-222222222222', 'Dîner Bistronomique', 'Menu découverte dans l''ancienne gare des Brotteaux. Cuisine créative et produits de saison.', CURRENT_DATE + 1, '19:00:00', 'Le Six Lyon', 'a-manger', 'À manger', '42€', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
('22222222-2222-2222-2222-222222222222', 'Clubbing Night - Speakeasy', 'Transformation en club après minuit. Accès au speakeasy souterrain avec DJ sets électro.', CURRENT_DATE + 3, '22:00:00', 'Le Six Lyon', 'soirees', 'Soirées', '20€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
('22222222-2222-2222-2222-222222222222', 'Happy Hour Gare', 'Cocktails dans le cadre unique de l''ancienne gare. Ambiance décontractée en début de soirée.', CURRENT_DATE + 6, '18:30:00', 'Le Six Lyon', 'a-boire', 'À boire', '15€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
('22222222-2222-2222-2222-222222222222', 'Weekend Clubbing', 'Soirée clubbing dans le speakeasy. Programmation DJ house et techno jusqu''à 4h du matin.', CURRENT_DATE + 10, '23:00:00', 'Le Six Lyon', 'soirees', 'Soirées', '25€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('22222222-2222-2222-2222-222222222222', 'Déjeuner Business', 'Menu déjeuner express pour professionnels. Service rapide dans le cadre historique de la gare.', CURRENT_DATE + 13, '12:00:00', 'Le Six Lyon', 'a-manger', 'À manger', '22€', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
('22222222-2222-2222-2222-222222222222', 'Soirée DJ Invité', 'DJ invité international pour une soirée électro exceptionnelle. Clubbing premium au speakeasy.', CURRENT_DATE + 17, '22:30:00', 'Le Six Lyon', 'soirees', 'Soirées', '30€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),

-- Événements LA FERIA (catégorie: a-boire + soirees)
('33333333-3333-3333-3333-333333333333', 'Soirée Tapas & Mojitos', 'Dégustation de tapas authentiques avec nos mojitos signature. Ambiance espagnole garantie.', CURRENT_DATE + 2, '19:00:00', 'La Feria Lyon', 'a-boire', 'À boire', '18€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
('33333333-3333-3333-3333-333333333333', 'Concert Flamenco Live', 'Concert de flamenco authentique avec guitariste et danseuse. Transformation en club après 23h.', CURRENT_DATE + 4, '21:00:00', 'La Feria Lyon', 'soirees', 'Soirées', '25€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('33333333-3333-3333-3333-333333333333', 'Cours de Salsa', 'Initiation et perfectionnement salsa avec professeur. Soirée dansante jusqu''à 2h du matin.', CURRENT_DATE + 7, '20:00:00', 'La Feria Lyon', 'soirees', 'Soirées', '15€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('33333333-3333-3333-3333-333333333333', 'Match Espagne - Retransmission', 'Retransmission du match sur grand écran. Tapas et sangria pour supporter La Roja.', CURRENT_DATE + 11, '21:00:00', 'La Feria Lyon', 'a-boire', 'À boire', '12€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
('33333333-3333-3333-3333-333333333333', 'DJ Set Latino', 'Soirée latino avec DJ spécialisé reggaeton, salsa, bachata. Ambiance club caribéenne.', CURRENT_DATE + 14, '22:00:00', 'La Feria Lyon', 'soirees', 'Soirées', '20€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
('33333333-3333-3333-3333-333333333333', 'Soirée Caïpirinha', 'Dégustation de caïpirinhas et cocktails latino. Tapas brésiliennes et musique bossa nova.', CURRENT_DATE + 18, '19:30:00', 'La Feria Lyon', 'a-boire', 'À boire', '16€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),

-- Événements DOCKS 40 (catégorie: a-boire)
('44444444-4444-4444-4444-444444444444', 'Jazz Session Terrasse', 'Concert jazz en terrasse avec vue sur la Saône. Ambiance décontractée et cocktails signature.', CURRENT_DATE + 3, '19:00:00', 'Docks 40 Lyon', 'a-boire', 'À boire', '14€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
('44444444-4444-4444-4444-444444444444', 'Soul Food Night', 'Soirée soul avec DJ set et cuisine française contemporaine. Terrasse ouverte si beau temps.', CURRENT_DATE + 6, '20:00:00', 'Docks 40 Lyon', 'a-boire', 'À boire', '18€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('44444444-4444-4444-4444-444444444444', 'Électro Chill Quais', 'Soirée électro chill avec vue sur les quais. Programmation house et deep house.', CURRENT_DATE + 9, '21:00:00', 'Docks 40 Lyon', 'a-boire', 'À boire', '16€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
('44444444-4444-4444-4444-444444444444', 'Rock Vintage Night', 'Soirée rock avec DJ sets vintage et modernes. Large carte de bières et cocktails.', CURRENT_DATE + 12, '20:30:00', 'Docks 40 Lyon', 'a-boire', 'À boire', '15€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('44444444-4444-4444-4444-444444444444', 'Pop Culture Quiz', 'Quiz pop culture avec DJ entre les manches. Cocktails thématiques et prix à gagner.', CURRENT_DATE + 15, '19:30:00', 'Docks 40 Lyon', 'a-boire', 'À boire', '12€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),

-- Événements LE SUCRE (catégorie: soirees)
('55555555-5555-5555-5555-555555555555', 'Électro Rooftop Experience', 'Soirée électronique sur le rooftop avec vue panoramique sur Lyon. DJ internationaux.', CURRENT_DATE + 1, '22:00:00', 'Le Sucre Lyon', 'soirees', 'Soirées', '25€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
('55555555-5555-5555-5555-555555555555', 'Concert Hip-Hop Live', 'Concert hip-hop avec artistes émergents lyonnais. Cadre industriel unique de La Sucrière.', CURRENT_DATE + 4, '21:00:00', 'Le Sucre Lyon', 'soirees', 'Soirées', '22€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('55555555-5555-5555-5555-555555555555', 'Jazz Fusion Rooftop', 'Concert jazz fusion avec vue sur Lyon. Mélange de jazz traditionnel et électronique.', CURRENT_DATE + 8, '20:00:00', 'Le Sucre Lyon', 'soirees', 'Soirées', '20€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('55555555-5555-5555-5555-555555555555', 'Techno Underground', 'Soirée techno pointue avec DJ spécialisés. Ambiance underground dans l''ancienne sucrière.', CURRENT_DATE + 11, '23:00:00', 'Le Sucre Lyon', 'soirees', 'Soirées', '28€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
('55555555-5555-5555-5555-555555555555', 'Événement Culturel Mix', 'Soirée mélangeant musique électronique et performances artistiques. Expérience culturelle unique.', CURRENT_DATE + 15, '19:30:00', 'Le Sucre Lyon', 'soirees', 'Soirées', '24€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('55555555-5555-5555-5555-555555555555', 'Sunrise Electronic', 'Soirée électronique jusqu''au lever du soleil. Vue exceptionnelle depuis le rooftop au petit matin.', CURRENT_DATE + 19, '22:30:00', 'Le Sucre Lyon', 'soirees', 'Soirées', '30€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),

-- Événements LES SALONS DU NH (catégorie: soirees)
('66666666-6666-6666-6666-666666666666', 'Hip-Hop Classic Night', 'Soirée hip-hop old school avec DJ spécialisés. 700m² d''espace pour 650 personnes maximum.', CURRENT_DATE + 2, '22:00:00', 'Les Salons du NH', 'soirees', 'Soirées', '18€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('66666666-6666-6666-6666-666666666666', 'Afro Beats Party', 'Soirée afro beats avec DJ africains invités. Ambiance énergique et danse jusqu''au bout de la nuit.', CURRENT_DATE + 5, '21:30:00', 'Les Salons du NH', 'soirees', 'Soirées', '20€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
('66666666-6666-6666-6666-666666666666', 'Caribéen Vibes', 'Soirée caribéenne avec dancehall, reggae et soca. Transport vers les îles garanti.', CURRENT_DATE + 8, '22:00:00', 'Les Salons du NH', 'soirees', 'Soirées', '19€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('66666666-6666-6666-6666-666666666666', 'Rap Game Battle', 'Battle de rap avec MC locaux et nationaux. Plusieurs espaces modulables pour l''événement.', CURRENT_DATE + 12, '21:00:00', 'Les Salons du NH', 'soirees', 'Soirées', '15€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
('66666666-6666-6666-6666-666666666666', 'Urban Mix Weekend', 'Mix hip-hop, afro et caribéen pour le weekend. Programmation DJ sur plusieurs espaces.', CURRENT_DATE + 16, '22:30:00', 'Les Salons du NH', 'soirees', 'Soirées', '22€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),

-- Événements L'HACHEZ-VOUS (catégorie: activites)
('77777777-7777-7777-7777-777777777777', 'Initiation Lancer de Hache', 'Découverte du lancer de hache avec nos experts. 6 cibles disponibles, équipement fourni.', CURRENT_DATE + 1, '18:00:00', 'L''Hachez-Vous Lyon', 'activites', 'Activités', '25€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
('77777777-7777-7777-7777-777777777777', 'EVG Viking Experience', 'Enterrement de vie de garçon version viking. Session privée avec ambiance musicale thématique.', CURRENT_DATE + 4, '19:30:00', 'L''Hachez-Vous Lyon', 'activites', 'Activités', '35€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
('77777777-7777-7777-7777-777777777777', 'Team Building Entreprise', 'Activité team building originale. Jusqu''à 18 personnes par session avec coaching.', CURRENT_DATE + 7, '14:00:00', 'L''Hachez-Vous Lyon', 'activites', 'Activités', '30€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
('77777777-7777-7777-7777-777777777777', 'Anniversaire Viking', 'Fête d''anniversaire thématique avec lancer de hache et déguisements. Ambiance garantie.', CURRENT_DATE + 10, '16:00:00', 'L''Hachez-Vous Lyon', 'activites', 'Activités', '28€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
('77777777-7777-7777-7777-777777777777', 'Tournoi de Haches', 'Compétition de lancer de hache avec classement et prix. Cibles digitales pour précision maximale.', CURRENT_DATE + 14, '17:00:00', 'L''Hachez-Vous Lyon', 'activites', 'Activités', '32€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
('77777777-7777-7777-7777-777777777777', 'EVJF Warrior Girls', 'Enterrement de vie de jeune fille version guerrière. Session privée avec photos souvenirs.', CURRENT_DATE + 17, '18:30:00', 'L''Hachez-Vous Lyon', 'activites', 'Activités', '33€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),

-- Événements MUSÉE DE L'ILLUSION (catégorie: activites)
('88888888-8888-8888-8888-888888888888', 'Visite Découverte Famille', 'Découverte des 70+ illusions sur 700m². Tunnel Vortex, hologrammes et explications scientifiques.', CURRENT_DATE + 2, '14:00:00', 'Musée de l''Illusion Lyon', 'activites', 'Activités', '16€', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop'),
('88888888-8888-8888-8888-888888888888', 'Atelier Photos Insolites', 'Session photos créatives avec nos illusions. Repartez avec des souvenirs uniques et décalés.', CURRENT_DATE + 5, '16:30:00', 'Musée de l''Illusion Lyon', 'activites', 'Activités', '20€', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop'),
('88888888-8888-8888-8888-888888888888', 'Escape Game Illusion', 'Escape game utilisant les illusions du musée. Résolvez les énigmes en famille ou entre amis.', CURRENT_DATE + 8, '15:00:00', 'Musée de l''Illusion Lyon', 'activites', 'Activités', '24€', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop'),
('88888888-8888-8888-8888-888888888888', 'Anniversaire Illusions', 'Fête d''anniversaire magique avec parcours personnalisé. Salle des Miroirs et casse-têtes inclus.', CURRENT_DATE + 11, '14:30:00', 'Musée de l''Illusion Lyon', 'activites', 'Activités', '22€', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop'),
('88888888-8888-8888-8888-888888888888', 'Soirée Adulte Mystère', 'Visite nocturne pour adultes avec explications scientifiques approfondies. Ambiance feutrée.', CURRENT_DATE + 15, '19:00:00', 'Musée de l''Illusion Lyon', 'activites', 'Activités', '18€', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop');

-- Phase 5: Ajouter des données réalistes (vues, likes, participants)
UPDATE public.business_events SET 
  views = floor(random() * 500) + 50,
  likes = floor(random() * 100) + 10,
  participants = floor(random() * 50) + 5;