-- Insérer des événements scrapés de test (avec venue_instagram mais sans venue_id)
-- Ces événements seront transférés automatiquement quand un business avec le même instagram_handle s'inscrit

INSERT INTO public.events (
  title, description, date, time, location, address, category,
  image_url, price, views, likes, participants,
  created_by, created_by_type, status,
  venue_instagram, venue_category, claimed
) VALUES
-- Événements pour @lesalonsdunh
('Soirée Cocktails & DJ Set', 'Une soirée exceptionnelle avec DJ résident et cocktails signatures dans un cadre unique.', 
 NOW() + INTERVAL '3 days', '21:00', 'Les Salons du NH', '26 Rue du Bât d''Argent, 69001 Lyon',
 'soirees', 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800', 15, 234, 45, 89,
 (SELECT id FROM profiles WHERE type = 'admin' LIMIT 1), 'admin', 'active',
 'lesalonsdunh', 'bar', false),

('Afterwork Presqu''île', 'Happy hour de 18h à 21h, -50% sur tous les cocktails classiques.',
 NOW() + INTERVAL '1 day', '18:00', 'Les Salons du NH', '26 Rue du Bât d''Argent, 69001 Lyon',
 'a-boire', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800', 0, 156, 28, 45,
 (SELECT id FROM profiles WHERE type = 'admin' LIMIT 1), 'admin', 'active',
 'lesalonsdunh', 'bar', false),

-- Événements pour @leferia_lyon
('Soirée Latina - Salsa & Bachata', 'Cours de salsa à 21h puis soirée dansante jusqu''à 4h du matin.',
 NOW() + INTERVAL '5 days', '21:00', 'La Feria', '12 Rue Désirée, 69001 Lyon',
 'soirees', 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800', 12, 567, 123, 234,
 (SELECT id FROM profiles WHERE type = 'admin' LIMIT 1), 'admin', 'active',
 'leferia_lyon', 'club', false),

('Mercredi Latino', 'La soirée latino incontournable du mercredi lyonnais !',
 NOW() + INTERVAL '2 days', '22:00', 'La Feria', '12 Rue Désirée, 69001 Lyon',
 'soirees', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', 10, 445, 89, 178,
 (SELECT id FROM profiles WHERE type = 'admin' LIMIT 1), 'admin', 'active',
 'leferia_lyon', 'club', false),

-- Événements pour @lesucre_lyon
('Techno Night - Resident DJs', 'Les résidents du Sucre aux platines pour une nuit techno mémorable.',
 NOW() + INTERVAL '4 days', '23:00', 'Le Sucre', '50 Quai Rambaud, 69002 Lyon',
 'soirees', 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800', 18, 789, 156, 312,
 (SELECT id FROM profiles WHERE type = 'admin' LIMIT 1), 'admin', 'active',
 'lesucre_lyon', 'club', false),

-- Événements pour @brume_lyon
('Dégustation Vins Nature', 'Découvrez notre sélection de vins naturels avec notre sommelier.',
 NOW() + INTERVAL '6 days', '19:00', 'Brume', '7 Rue Chavanne, 69001 Lyon',
 'a-boire', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', 25, 123, 34, 24,
 (SELECT id FROM profiles WHERE type = 'admin' LIMIT 1), 'admin', 'active',
 'brume_lyon', 'bar', false),

('Apéro Tapas du Jeudi', 'Tapas maison et vins au verre dans une ambiance cosy.',
 NOW() + INTERVAL '8 days', '18:30', 'Brume', '7 Rue Chavanne, 69001 Lyon',
 'a-manger', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', 18, 98, 23, 32,
 (SELECT id FROM profiles WHERE type = 'admin' LIMIT 1), 'admin', 'active',
 'brume_lyon', 'restaurant', false);