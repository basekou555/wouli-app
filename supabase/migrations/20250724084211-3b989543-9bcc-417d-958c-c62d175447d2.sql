-- Phase 1: Nettoyage de la config orpheline
DELETE FROM public.business_configs WHERE user_id = '862b247f-5c8b-432b-bdfc-6f8bb2771042';

-- Phase 2: Création des 8 établissements lyonnais

-- Fonction helper pour créer un utilisateur business
CREATE OR REPLACE FUNCTION create_business_user(
  user_email text,
  user_password text,
  username text,
  client_name text,
  client_type text,
  location text,
  brand_color text DEFAULT '#FF7A1F',
  features text[] DEFAULT ARRAY['events', 'stats', 'redirections']
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Générer un UUID pour l'utilisateur
  new_user_id := gen_random_uuid();
  
  -- Créer le profil dans profiles
  INSERT INTO public.profiles (id, username, type, bio, city, website)
  VALUES (
    new_user_id,
    username,
    'business',
    client_name || ' - ' || client_type,
    'Lyon',
    'www.' || lower(replace(username, '_', '-')) || '.wouli-demo.fr'
  );
  
  -- Créer la configuration business
  INSERT INTO public.business_configs (user_id, client_name, client_type, location, brand_color, features)
  VALUES (
    new_user_id,
    client_name,
    client_type,
    location,
    brand_color,
    features
  );
  
  RETURN new_user_id;
END;
$$;

-- Création des 8 établissements

-- 1. BRUME RESTAURANT
SELECT create_business_user(
  'brume@wouli-demo.fr',
  'demo2024',
  'brume_lyon',
  'Brume Lyon',
  'Restaurant festif',
  'Rue de la Bourse, 69002 Lyon',
  '#E67E22',
  ARRAY['events', 'stats', 'redirections', 'reservations']
);

-- 2. LE SIX
SELECT create_business_user(
  'lesix@wouli-demo.fr',
  'demo2024',
  'le_six_lyon',
  'Le Six Lyon',
  'Restaurant festif / Bar-restaurant',
  '13 Place Jules Ferry, 69006 Lyon',
  '#9B59B6',
  ARRAY['events', 'stats', 'redirections', 'clubbing']
);

-- 3. LA FERIA
SELECT create_business_user(
  'laferia@wouli-demo.fr',
  'demo2024',
  'la_feria_lyon',
  'La Feria Lyon',
  'Bar à tapas / Club Latino',
  '13 Quai Romain Rolland, 69005 Lyon',
  '#E74C3C',
  ARRAY['events', 'stats', 'redirections', 'concerts']
);

-- 4. DOCKS 40
SELECT create_business_user(
  'docks40@wouli-demo.fr',
  'demo2024',
  'docks_40_lyon',
  'Docks 40 Lyon',
  'Bar-restaurant avec programmation musicale',
  'Quais de Saône, 69009 Lyon',
  '#3498DB',
  ARRAY['events', 'stats', 'redirections', 'programmation']
);

-- 5. LE SUCRE
SELECT create_business_user(
  'lesucre@wouli-demo.fr',
  'demo2024',
  'le_sucre_lyon',
  'Le Sucre Lyon',
  'Club / Lieu culturel rooftop',
  '50 Quai Rambaud, 69002 Lyon',
  '#F39C12',
  ARRAY['events', 'stats', 'redirections', 'rooftop', 'culturel']
);

-- 6. LES SALONS DU NH
SELECT create_business_user(
  'salonsnh@wouli-demo.fr',
  'demo2024',
  'salons_du_nh',
  'Les Salons du NH',
  'Club Hip-Hop/Afro/Caribéen',
  '6 Rue Henri Barbusse, 69008 Lyon',
  '#8E44AD',
  ARRAY['events', 'stats', 'redirections', 'urbain']
);

-- 7. L'HACHEZ-VOUS
SELECT create_business_user(
  'hachez@wouli-demo.fr',
  'demo2024',
  'hachez_vous_lyon',
  'L''Hachez-Vous Lyon',
  'Lancer de hache / Activité insolite',
  '4 Rue de l''Épée, 69003 Lyon',
  '#27AE60',
  ARRAY['events', 'stats', 'redirections', 'team-building']
);

-- 8. MUSÉE DE L'ILLUSION
SELECT create_business_user(
  'musee@wouli-demo.fr',
  'demo2024',
  'musee_illusion_lyon',
  'Musée de l''Illusion Lyon',
  'Musée interactif / Activité culturelle',
  'Grand Hôtel-Dieu, 69002 Lyon',
  '#16A085',
  ARRAY['events', 'stats', 'redirections', 'famille', 'educatif']
);

-- Phase 3: Création d'événements démo pour chaque établissement
-- (Événements sur les 3 prochaines semaines)

-- Événements BRUME RESTAURANT (catégorie: a-manger)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
) 
SELECT 
  p.id,
  evt.title,
  evt.description,
  evt.date,
  evt.time,
  'Brume Lyon',
  'a-manger',
  evt.event_type,
  evt.price,
  evt.image_url
FROM public.profiles p,
(VALUES 
  ('Dîner Franco-Asiatique', 'Menu fusion créatif avec accords vins. Cuisine raffinée mêlant traditions françaises et saveurs asiatiques.', CURRENT_DATE + 2, '19:30:00', 'À manger', '45€', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
  ('Soirée Cocktails & Dim Sum', 'Découverte de nos dim sum maison accompagnés de cocktails signatures dans la salle Chartreuse.', CURRENT_DATE + 5, '18:00:00', 'À boire', '32€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
  ('Brunch Festif Weekend', 'Brunch franco-asiatique avec DJ set ambient. Ambiance décontractée pour commencer le weekend.', CURRENT_DATE + 9, '11:00:00', 'À manger', '28€', 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop'),
  ('Masterclass Cuisine Fusion', 'Atelier culinaire avec notre chef. Apprenez les secrets de la cuisine franco-asiatique.', CURRENT_DATE + 12, '14:00:00', 'À manger', '65€', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
  ('Soirée Privée Chartreuse', 'Privatisation de notre salle Chartreuse pour une soirée exclusive. Ambiance festive garantie.', CURRENT_DATE + 16, '20:00:00', 'Soirées', '80€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop')
) AS evt(title, description, date, time, event_type, price, image_url)
WHERE p.username = 'brume_lyon';

-- Événements LE SIX (catégorie mixte: a-manger + soirees)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
)
SELECT 
  p.id,
  evt.title,
  evt.description,
  evt.date,
  evt.time,
  'Le Six Lyon',
  evt.category,
  evt.event_type,
  evt.price,
  evt.image_url
FROM public.profiles p,
(VALUES 
  ('Dîner Bistronomique', 'Menu découverte dans l''ancienne gare des Brotteaux. Cuisine créative et produits de saison.', CURRENT_DATE + 1, '19:00:00', 'a-manger', 'À manger', '42€', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
  ('Clubbing Night - Speakeasy', 'Transformation en club après minuit. Accès au speakeasy souterrain avec DJ sets électro.', CURRENT_DATE + 3, '22:00:00', 'soirees', 'Soirées', '20€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
  ('Happy Hour Gare', 'Cocktails dans le cadre unique de l''ancienne gare. Ambiance décontractée en début de soirée.', CURRENT_DATE + 6, '18:30:00', 'a-boire', 'À boire', '15€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
  ('Weekend Clubbing', 'Soirée clubbing dans le speakeasy. Programmation DJ house et techno jusqu''à 4h du matin.', CURRENT_DATE + 10, '23:00:00', 'soirees', 'Soirées', '25€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Déjeuner Business', 'Menu déjeuner express pour professionnels. Service rapide dans le cadre historique de la gare.', CURRENT_DATE + 13, '12:00:00', 'a-manger', 'À manger', '22€', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'),
  ('Soirée DJ Invité', 'DJ invité international pour une soirée électro exceptionnelle. Clubbing premium au speakeasy.', CURRENT_DATE + 17, '22:30:00', 'soirees', 'Soirées', '30€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop')
) AS evt(title, description, date, time, category, event_type, price, image_url)
WHERE p.username = 'le_six_lyon';

-- Événements LA FERIA (catégorie: a-boire + soirees)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
)
SELECT 
  p.id,
  evt.title,
  evt.description,
  evt.date,
  evt.time,
  'La Feria Lyon',
  evt.category,
  evt.event_type,
  evt.price,
  evt.image_url
FROM public.profiles p,
(VALUES 
  ('Soirée Tapas & Mojitos', 'Dégustation de tapas authentiques avec nos mojitos signature. Ambiance espagnole garantie.', CURRENT_DATE + 2, '19:00:00', 'a-boire', 'À boire', '18€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
  ('Concert Flamenco Live', 'Concert de flamenco authentique avec guitariste et danseuse. Transformation en club après 23h.', CURRENT_DATE + 4, '21:00:00', 'soirees', 'Soirées', '25€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Cours de Salsa', 'Initiation et perfectionnement salsa avec professeur. Soirée dansante jusqu''à 2h du matin.', CURRENT_DATE + 7, '20:00:00', 'soirees', 'Soirées', '15€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Match Espagne - Retransmission', 'Retransmission du match sur grand écran. Tapas et sangria pour supporter La Roja.', CURRENT_DATE + 11, '21:00:00', 'a-boire', 'À boire', '12€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
  ('DJ Set Latino', 'Soirée latino avec DJ spécialisé reggaeton, salsa, bachata. Ambiance club caribéenne.', CURRENT_DATE + 14, '22:00:00', 'soirees', 'Soirées', '20€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
  ('Soirée Caïpirinha', 'Dégustation de caïpirinhas et cocktails latino. Tapas brésiliennes et musique bossa nova.', CURRENT_DATE + 18, '19:30:00', 'a-boire', 'À boire', '16€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop')
) AS evt(title, description, date, time, category, event_type, price, image_url)
WHERE p.username = 'la_feria_lyon';

-- Événements DOCKS 40 (catégorie: a-boire)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
)
SELECT 
  p.id,
  evt.title,
  evt.description,
  evt.date,
  evt.time,
  'Docks 40 Lyon',
  'a-boire',
  evt.event_type,
  evt.price,
  evt.image_url
FROM public.profiles p,
(VALUES 
  ('Jazz Session Terrasse', 'Concert jazz en terrasse avec vue sur la Saône. Ambiance décontractée et cocktails signature.', CURRENT_DATE + 3, '19:00:00', 'À boire', '14€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop'),
  ('Soul Food Night', 'Soirée soul avec DJ set et cuisine française contemporaine. Terrasse ouverte si beau temps.', CURRENT_DATE + 6, '20:00:00', 'À boire', '18€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Électro Chill Quais', 'Soirée électro chill avec vue sur les quais. Programmation house et deep house.', CURRENT_DATE + 9, '21:00:00', 'À boire', '16€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
  ('Rock Vintage Night', 'Soirée rock avec DJ sets vintage et modernes. Large carte de bières et cocktails.', CURRENT_DATE + 12, '20:30:00', 'À boire', '15€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Pop Culture Quiz', 'Quiz pop culture avec DJ entre les manches. Cocktails thématiques et prix à gagner.', CURRENT_DATE + 15, '19:30:00', 'À boire', '12€', 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop')
) AS evt(title, description, date, time, event_type, price, image_url)
WHERE p.username = 'docks_40_lyon';

-- Événements LE SUCRE (catégorie: soirees)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
)
SELECT 
  p.id,
  evt.title,
  evt.description,
  evt.date,
  evt.time,
  'Le Sucre Lyon',
  'soirees',
  evt.event_type,
  evt.price,
  evt.image_url
FROM public.profiles p,
(VALUES 
  ('Électro Rooftop Experience', 'Soirée électronique sur le rooftop avec vue panoramique sur Lyon. DJ internationaux.', CURRENT_DATE + 1, '22:00:00', 'Soirées', '25€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
  ('Concert Hip-Hop Live', 'Concert hip-hop avec artistes émergents lyonnais. Cadre industriel unique de La Sucrière.', CURRENT_DATE + 4, '21:00:00', 'Soirées', '22€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Jazz Fusion Rooftop', 'Concert jazz fusion avec vue sur Lyon. Mélange de jazz traditionnel et électronique.', CURRENT_DATE + 8, '20:00:00', 'Soirées', '20€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Techno Underground', 'Soirée techno pointue avec DJ spécialisés. Ambiance underground dans l''ancienne sucrière.', CURRENT_DATE + 11, '23:00:00', 'Soirées', '28€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
  ('Événement Culturel Mix', 'Soirée mélangeant musique électronique et performances artistiques. Expérience culturelle unique.', CURRENT_DATE + 15, '19:30:00', 'Soirées', '24€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Sunrise Electronic', 'Soirée électronique jusqu''au lever du soleil. Vue exceptionnelle depuis le rooftop au petit matin.', CURRENT_DATE + 19, '22:30:00', 'Soirées', '30€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop')
) AS evt(title, description, date, time, event_type, price, image_url)
WHERE p.username = 'le_sucre_lyon';

-- Événements LES SALONS DU NH (catégorie: soirees)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
)
SELECT 
  p.id,
  evt.title,
  evt.description,
  evt.date,
  evt.time,
  'Les Salons du NH',
  'soirees',
  evt.event_type,
  evt.price,
  evt.image_url
FROM public.profiles p,
(VALUES 
  ('Hip-Hop Classic Night', 'Soirée hip-hop old school avec DJ spécialisés. 700m² d''espace pour 650 personnes maximum.', CURRENT_DATE + 2, '22:00:00', 'Soirées', '18€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Afro Beats Party', 'Soirée afro beats avec DJ africains invités. Ambiance énergique et danse jusqu''au bout de la nuit.', CURRENT_DATE + 5, '21:30:00', 'Soirées', '20€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop'),
  ('Caribéen Vibes', 'Soirée caribéenne avec dancehall, reggae et soca. Transport vers les îles garanti.', CURRENT_DATE + 8, '22:00:00', 'Soirées', '19€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Rap Game Battle', 'Battle de rap avec MC locaux et nationaux. Plusieurs espaces modulables pour l''événement.', CURRENT_DATE + 12, '21:00:00', 'Soirées', '15€', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop'),
  ('Urban Mix Weekend', 'Mix hip-hop, afro et caribéen pour le weekend. Programmation DJ sur plusieurs espaces.', CURRENT_DATE + 16, '22:30:00', 'Soirées', '22€', 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop')
) AS evt(title, description, date, time, event_type, price, image_url)
WHERE p.username = 'salons_du_nh';

-- Événements L'HACHEZ-VOUS (catégorie: activites)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
)
SELECT 
  p.id,
  evt.title,
  evt.description,
  evt.date,
  evt.time,
  'L''Hachez-Vous Lyon',
  'activites',
  evt.event_type,
  evt.price,
  evt.image_url
FROM public.profiles p,
(VALUES 
  ('Initiation Lancer de Hache', 'Découverte du lancer de hache avec nos experts. 6 cibles disponibles, équipement fourni.', CURRENT_DATE + 1, '18:00:00', 'Activités', '25€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
  ('EVG Viking Experience', 'Enterrement de vie de garçon version viking. Session privée avec ambiance musicale thématique.', CURRENT_DATE + 4, '19:30:00', 'Activités', '35€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
  ('Team Building Entreprise', 'Activité team building originale. Jusqu''à 18 personnes par session avec coaching.', CURRENT_DATE + 7, '14:00:00', 'Activités', '30€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
  ('Anniversaire Viking', 'Fête d''anniversaire thématique avec lancer de hache et déguisements. Ambiance garantie.', CURRENT_DATE + 10, '16:00:00', 'Activités', '28€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
  ('Tournoi de Haches', 'Compétition de lancer de hache avec classement et prix. Cibles digitales pour précision maximale.', CURRENT_DATE + 14, '17:00:00', 'Activités', '32€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop'),
  ('EVJF Warrior Girls', 'Enterrement de vie de jeune fille version guerrière. Session privée avec photos souvenirs.', CURRENT_DATE + 17, '18:30:00', 'Activités', '33€', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop')
) AS evt(title, description, date, time, event_type, price, image_url)
WHERE p.username = 'hachez_vous_lyon';

-- Événements MUSÉE DE L'ILLUSION (catégorie: activites)
INSERT INTO public.business_events (
  user_id, title, description, date, time, venue, category, event_type, price, image_url
)
SELECT 
  p.id,
  evt.title,
  evt.description,
  evt.date,
  evt.time,
  'Musée de l''Illusion Lyon',
  'activites',
  evt.event_type,
  evt.price,
  evt.image_url
FROM public.profiles p,
(VALUES 
  ('Visite Découverte Famille', 'Découverte des 70+ illusions sur 700m². Tunnel Vortex, hologrammes et explications scientifiques.', CURRENT_DATE + 2, '14:00:00', 'Activités', '16€', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop'),
  ('Atelier Photos Insolites', 'Session photos créatives avec nos illusions. Repartez avec des souvenirs uniques et décalés.', CURRENT_DATE + 5, '16:30:00', 'Activités', '20€', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop'),
  ('Escape Game Illusion', 'Escape game utilisant les illusions du musée. Résolvez les énigmes en famille ou entre amis.', CURRENT_DATE + 8, '15:00:00', 'Activités', '24€', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop'),
  ('Anniversaire Illusions', 'Fête d''anniversaire magique avec parcours personnalisé. Salle des Miroirs et casse-têtes inclus.', CURRENT_DATE + 11, '14:30:00', 'Activités', '22€', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop'),
  ('Soirée Adulte Mystère', 'Visite nocturne pour adultes avec explications scientifiques approfondies. Ambiance feutrée.', CURRENT_DATE + 15, '19:00:00', 'Activités', '18€', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop')
) AS evt(title, description, date, time, event_type, price, image_url)
WHERE p.username = 'musee_illusion_lyon';

-- Ajouter quelques vues, likes et participants aléatoires pour rendre les données réalistes
UPDATE public.business_events SET 
  views = floor(random() * 500) + 50,
  likes = floor(random() * 100) + 10,
  participants = floor(random() * 50) + 5;

-- Nettoyer la fonction helper
DROP FUNCTION create_business_user(text, text, text, text, text, text, text, text[]);