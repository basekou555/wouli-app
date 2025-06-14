
-- Insert demo business configurations with valid UUIDs
INSERT INTO public.business_configs (id, client_name, client_type, location, brand_color, features, user_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Blue Note Bar', 'Bar/Restaurant', 'Lyon - Presqu''île', '#FF7A1F', ARRAY['events', 'stats', 'redirections'], '550e8400-e29b-41d4-a716-446655440011'),
('550e8400-e29b-41d4-a716-446655440002', 'Club Nyx', 'Boîte de Nuit', 'Lyon - Part-Dieu', '#8B5CF6', ARRAY['events', 'stats', 'redirections', 'ranking'], '550e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440003', 'FitMax Gym', 'Salle de Sport', 'Lyon - Confluence', '#10B981', ARRAY['events', 'stats', 'redirections', 'classes'], '550e8400-e29b-41d4-a716-446655440013');

-- Insert demo business events with valid UUIDs
INSERT INTO public.business_events (id, title, description, date, time, venue, category, event_type, price, image_url, views, likes, participants, user_id) VALUES
-- Blue Note Bar events
('650e8400-e29b-41d4-a716-446655440001', 'Soirée Jazz Live', 'Une soirée jazz intimiste avec le trio "Lyon Jazz Collective". Ambiance feutrée et cocktails signatures.', '2024-06-20', '20:00', 'Blue Note Bar', 'bar', 'À boire', '15€', 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop', 245, 42, 78, '550e8400-e29b-41d4-a716-446655440011'),
('650e8400-e29b-41d4-a716-446655440002', 'Happy Hour Cocktails', 'Tous les cocktails à -50% de 18h à 20h ! Découvrez nos créations originales dans une ambiance décontractée.', '2024-06-18', '18:00', 'Blue Note Bar', 'bar', 'À boire', '8€', 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop', 156, 28, 45, '550e8400-e29b-41d4-a716-446655440011'),
('650e8400-e29b-41d4-a716-446655440003', 'Dégustation Vins & Fromages', 'Soirée découverte avec notre sommelier. Sélection de vins locaux accompagnés de fromages d''exception.', '2024-06-22', '19:30', 'Blue Note Bar', 'bar', 'À manger', '25€', 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800&h=600&fit=crop', 189, 35, 32, '550e8400-e29b-41d4-a716-446655440011'),

-- Club Nyx events
('650e8400-e29b-41d4-a716-446655440004', 'Nyx Electronic Night', 'La plus grosse soirée électro de Lyon ! DJ internationaux, lightshow exceptionnel et ambiance survoltée.', '2024-06-21', '22:00', 'Club Nyx', 'club', 'Soirées', '20€', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop', 892, 156, 234, '550e8400-e29b-41d4-a716-446655440012'),
('650e8400-e29b-41d4-a716-446655440005', 'Ladies Night', 'Soirée spéciale pour les femmes ! Entrée gratuite et cocktails offerts jusqu''à minuit.', '2024-06-19', '21:00', 'Club Nyx', 'club', 'Soirées', 'Gratuit', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop', 445, 89, 167, '550e8400-e29b-41d4-a716-446655440012'),

-- FitMax Gym events
('650e8400-e29b-41d4-a716-446655440006', 'Cours de Yoga Sunrise', 'Commencez votre journée en douceur avec notre cours de yoga matinal. Tous niveaux bienvenus.', '2024-06-17', '07:00', 'FitMax Gym', 'sport', 'Activités', '12€', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop', 123, 34, 28, '550e8400-e29b-41d4-a716-446655440013'),
('650e8400-e29b-41d4-a716-446655440007', 'CrossFit Challenge', 'Défi CrossFit inter-équipes ! Venez tester vos limites dans une ambiance conviviale et motivante.', '2024-06-23', '10:00', 'FitMax Gym', 'sport', 'Activités', '15€', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', 267, 67, 45, '550e8400-e29b-41d4-a716-446655440013'),
('650e8400-e29b-41d4-a716-446655440008', 'Aqua Fitness Party', 'Cours d''aqua fitness en musique ! Dépensez-vous dans l''eau avec notre coach dynamique.', '2024-06-25', '19:00', 'FitMax Gym', 'sport', 'Activités', '10€', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop', 98, 23, 19, '550e8400-e29b-41d4-a716-446655440013');
