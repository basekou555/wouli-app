// Données des 8 établissements lyonnais pour Option A
// Ces données serviront de référence pour créer les comptes via /business/signup

export interface EstablishmentData {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  email: string;
  brandColor: string;
  features: string[];
  category: 'restaurant' | 'bar' | 'club' | 'activity';
  events: Array<{
    title: string;
    description: string;
    category: 'a-manger' | 'a-boire' | 'soirees' | 'activites';
    eventType: string;
    price: string;
    imageUrl: string;
    daysFromNow: number;
    time: string;
  }>;
}

export const lyonEstablishments: EstablishmentData[] = [
  // 1. RESTAURANTS FESTIFS
  {
    id: 'brume-lyon',
    name: 'Brume Lyon',
    type: 'Restaurant festif',
    description: 'Restaurant festif avec cuisine franco-asiatique. Ambiance chaleureuse le soir avec possibilité de prolonger jusqu\'à 1h du matin pour des soirées endiablées.',
    location: 'Rue de la Bourse, 69002 Lyon',
    email: 'brume@wouli-demo.fr',
    brandColor: '#E67E22',
    features: ['events', 'stats', 'redirections', 'reservations'],
    category: 'restaurant',
    events: [
      {
        title: 'Dîner Franco-Asiatique',
        description: 'Menu fusion créatif avec accords vins. Cuisine raffinée mêlant traditions françaises et saveurs asiatiques.',
        category: 'a-manger',
        eventType: 'À manger',
        price: '45€',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        daysFromNow: 2,
        time: '19:30'
      },
      {
        title: 'Soirée Cocktails & Dim Sum',
        description: 'Découverte de nos dim sum maison accompagnés de cocktails signatures dans la salle Chartreuse.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '32€',
        imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
        daysFromNow: 5,
        time: '18:00'
      },
      {
        title: 'Brunch Festif Weekend',
        description: 'Brunch franco-asiatique avec DJ set ambient. Ambiance décontractée pour commencer le weekend.',
        category: 'a-manger',
        eventType: 'À manger',
        price: '28€',
        imageUrl: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=600&fit=crop',
        daysFromNow: 9,
        time: '11:00'
      },
      {
        title: 'Masterclass Cuisine Fusion',
        description: 'Atelier culinaire avec notre chef. Apprenez les secrets de la cuisine franco-asiatique.',
        category: 'a-manger',
        eventType: 'À manger',
        price: '65€',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        daysFromNow: 12,
        time: '14:00'
      },
      {
        title: 'Soirée Privée Chartreuse',
        description: 'Privatisation de notre salle Chartreuse pour une soirée exclusive. Ambiance festive garantie.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '80€',
        imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
        daysFromNow: 16,
        time: '20:00'
      }
    ]
  },
  {
    id: 'le-six-lyon',
    name: 'Le Six Lyon',
    type: 'Restaurant festif / Bar-restaurant',
    description: 'Installé dans l\'ancienne gare des Brotteaux. Restaurant bistronomique qui se transforme en ambiance clubbing après minuit avec speakeasy au sous-sol.',
    location: '13 Place Jules Ferry, 69006 Lyon',
    email: 'lesix@wouli-demo.fr',
    brandColor: '#9B59B6',
    features: ['events', 'stats', 'redirections', 'clubbing'],
    category: 'restaurant',
    events: [
      {
        title: 'Dîner Bistronomique',
        description: 'Menu découverte dans l\'ancienne gare des Brotteaux. Cuisine créative et produits de saison.',
        category: 'a-manger',
        eventType: 'À manger',
        price: '42€',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        daysFromNow: 1,
        time: '19:00'
      },
      {
        title: 'Clubbing Night - Speakeasy',
        description: 'Transformation en club après minuit. Accès au speakeasy souterrain avec DJ sets électro.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '20€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 3,
        time: '22:00'
      },
      {
        title: 'Happy Hour Gare',
        description: 'Cocktails dans le cadre unique de l\'ancienne gare. Ambiance décontractée en début de soirée.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '15€',
        imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
        daysFromNow: 6,
        time: '18:30'
      },
      {
        title: 'Weekend Clubbing',
        description: 'Soirée clubbing dans le speakeasy. Programmation DJ house et techno jusqu\'à 4h du matin.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '25€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 10,
        time: '23:00'
      },
      {
        title: 'Déjeuner Business',
        description: 'Menu déjeuner express pour professionnels. Service rapide dans le cadre historique de la gare.',
        category: 'a-manger',
        eventType: 'À manger',
        price: '22€',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        daysFromNow: 13,
        time: '12:00'
      },
      {
        title: 'Soirée DJ Invité',
        description: 'DJ invité international pour une soirée électro exceptionnelle. Clubbing premium au speakeasy.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '30€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 17,
        time: '22:30'
      }
    ]
  },

  // 2. BARS AVEC PROGRAMMATION
  {
    id: 'la-feria-lyon',
    name: 'La Feria Lyon',
    type: 'Bar à tapas / Club Latino',
    description: 'Bar à tapas espagnol qui se transforme en discothèque après 23h. Programmation latino avec concerts live, cours de salsa, DJ sets hispaniques.',
    location: '13 Quai Romain Rolland, 69005 Lyon',
    email: 'laferia@wouli-demo.fr',
    brandColor: '#E74C3C',
    features: ['events', 'stats', 'redirections', 'concerts'],
    category: 'bar',
    events: [
      {
        title: 'Soirée Tapas & Mojitos',
        description: 'Dégustation de tapas authentiques avec nos mojitos signature. Ambiance espagnole garantie.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '18€',
        imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
        daysFromNow: 2,
        time: '19:00'
      },
      {
        title: 'Concert Flamenco Live',
        description: 'Concert de flamenco authentique avec guitariste et danseuse. Transformation en club après 23h.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '25€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 4,
        time: '21:00'
      },
      {
        title: 'Cours de Salsa',
        description: 'Initiation et perfectionnement salsa avec professeur. Soirée dansante jusqu\'à 2h du matin.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '15€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 7,
        time: '20:00'
      },
      {
        title: 'Match Espagne - Retransmission',
        description: 'Retransmission du match sur grand écran. Tapas et sangria pour supporter La Roja.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '12€',
        imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
        daysFromNow: 11,
        time: '21:00'
      },
      {
        title: 'DJ Set Latino',
        description: 'Soirée latino avec DJ spécialisé reggaeton, salsa, bachata. Ambiance club caribéenne.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '20€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 14,
        time: '22:00'
      },
      {
        title: 'Soirée Caïpirinha',
        description: 'Dégustation de caïpirinhas et cocktails latino. Tapas brésiliennes et musique bossa nova.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '16€',
        imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
        daysFromNow: 18,
        time: '19:30'
      }
    ]
  },
  {
    id: 'docks-40-lyon',
    name: 'Docks 40 Lyon',
    type: 'Bar-restaurant avec programmation musicale',
    description: 'Cadre intérieur et extérieur avec programmation jazz, soul, pop, rock et électro. Soirées à thème régulières.',
    location: 'Quais de Saône, 69009 Lyon',
    email: 'docks40@wouli-demo.fr',
    brandColor: '#3498DB',
    features: ['events', 'stats', 'redirections', 'programmation'],
    category: 'bar',
    events: [
      {
        title: 'Jazz Session Terrasse',
        description: 'Concert jazz en terrasse avec vue sur la Saône. Ambiance décontractée et cocktails signature.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '14€',
        imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
        daysFromNow: 3,
        time: '19:00'
      },
      {
        title: 'Soul Food Night',
        description: 'Soirée soul avec DJ set et cuisine française contemporaine. Terrasse ouverte si beau temps.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '18€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 6,
        time: '20:00'
      },
      {
        title: 'Électro Chill Quais',
        description: 'Soirée électro chill avec vue sur les quais. Programmation house et deep house.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '16€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 9,
        time: '21:00'
      },
      {
        title: 'Rock Vintage Night',
        description: 'Soirée rock avec DJ sets vintage et modernes. Large carte de bières et cocktails.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '15€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 12,
        time: '20:30'
      },
      {
        title: 'Pop Culture Quiz',
        description: 'Quiz pop culture avec DJ entre les manches. Cocktails thématiques et prix à gagner.',
        category: 'a-boire',
        eventType: 'À boire',
        price: '12€',
        imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop',
        daysFromNow: 15,
        time: '19:30'
      }
    ]
  },

  // 3. CLUBS
  {
    id: 'le-sucre-lyon',
    name: 'Le Sucre Lyon',
    type: 'Club / Lieu culturel rooftop',
    description: 'Club sur le toit de La Sucrière, 780 places. Programmation électronique pointue, concerts live, événements culturels. Vue panoramique sur Lyon.',
    location: '50 Quai Rambaud, 69002 Lyon',
    email: 'lesucre@wouli-demo.fr',
    brandColor: '#F39C12',
    features: ['events', 'stats', 'redirections', 'rooftop', 'culturel'],
    category: 'club',
    events: [
      {
        title: 'Électro Rooftop Experience',
        description: 'Soirée électronique sur le rooftop avec vue panoramique sur Lyon. DJ internationaux.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '25€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 1,
        time: '22:00'
      },
      {
        title: 'Concert Hip-Hop Live',
        description: 'Concert hip-hop avec artistes émergents lyonnais. Cadre industriel unique de La Sucrière.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '22€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 4,
        time: '21:00'
      },
      {
        title: 'Jazz Fusion Rooftop',
        description: 'Concert jazz fusion avec vue sur Lyon. Mélange de jazz traditionnel et électronique.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '20€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 8,
        time: '20:00'
      },
      {
        title: 'Techno Underground',
        description: 'Soirée techno pointue avec DJ spécialisés. Ambiance underground dans l\'ancienne sucrière.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '28€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 11,
        time: '23:00'
      },
      {
        title: 'Événement Culturel Mix',
        description: 'Soirée mélangeant musique électronique et performances artistiques. Expérience culturelle unique.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '24€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 15,
        time: '19:30'
      },
      {
        title: 'Sunrise Electronic',
        description: 'Soirée électronique jusqu\'au lever du soleil. Vue exceptionnelle depuis le rooftop au petit matin.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '30€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 19,
        time: '22:30'
      }
    ]
  },
  {
    id: 'salons-du-nh',
    name: 'Les Salons du NH',
    type: 'Club Hip-Hop/Afro/Caribéen',
    description: 'Référence du Hip-hop, Afro et Caribéen à Lyon. 700m² modulables, capacité 650 personnes. Programmation urbaine avec DJ\'s spécialisés.',
    location: '6 Rue Henri Barbusse, 69008 Lyon',
    email: 'salonsnh@wouli-demo.fr',
    brandColor: '#8E44AD',
    features: ['events', 'stats', 'redirections', 'urbain'],
    category: 'club',
    events: [
      {
        title: 'Hip-Hop Classic Night',
        description: 'Soirée hip-hop old school avec DJ spécialisés. 700m² d\'espace pour 650 personnes maximum.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '18€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 2,
        time: '22:00'
      },
      {
        title: 'Afro Beats Party',
        description: 'Soirée afro beats avec DJ africains invités. Ambiance énergique et danse jusqu\'au bout de la nuit.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '20€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 5,
        time: '21:30'
      },
      {
        title: 'Caribéen Vibes',
        description: 'Soirée caribéenne avec dancehall, reggae et soca. Transport vers les îles garanti.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '19€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 8,
        time: '22:00'
      },
      {
        title: 'Rap Game Battle',
        description: 'Battle de rap avec MC locaux et nationaux. Plusieurs espaces modulables pour l\'événement.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '15€',
        imageUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=600&fit=crop',
        daysFromNow: 12,
        time: '21:00'
      },
      {
        title: 'Urban Mix Weekend',
        description: 'Mix hip-hop, afro et caribéen pour le weekend. Programmation DJ sur plusieurs espaces.',
        category: 'soirees',
        eventType: 'Soirées',
        price: '22€',
        imageUrl: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop',
        daysFromNow: 16,
        time: '22:30'
      }
    ]
  },

  // 4. ACTIVITÉS
  {
    id: 'hachez-vous-lyon',
    name: 'L\'Hachez-Vous Lyon',
    type: 'Lancer de hache / Activité insolite',
    description: 'N°1 français du lancer de hache. 6 cibles, jusqu\'à 18 personnes par session. Activité viking avec ambiance musicale et équipements thématiques.',
    location: '4 Rue de l\'Épée, 69003 Lyon',
    email: 'hachez@wouli-demo.fr',
    brandColor: '#27AE60',
    features: ['events', 'stats', 'redirections', 'team-building'],
    category: 'activity',
    events: [
      {
        title: 'Initiation Lancer de Hache',
        description: 'Découverte du lancer de hache avec nos experts. 6 cibles disponibles, équipement fourni.',
        category: 'activites',
        eventType: 'Activités',
        price: '25€',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
        daysFromNow: 1,
        time: '18:00'
      },
      {
        title: 'EVG Viking Experience',
        description: 'Enterrement de vie de garçon version viking. Session privée avec ambiance musicale thématique.',
        category: 'activites',
        eventType: 'Activités',
        price: '35€',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
        daysFromNow: 4,
        time: '19:30'
      },
      {
        title: 'Team Building Entreprise',
        description: 'Activité team building originale. Jusqu\'à 18 personnes par session avec coaching.',
        category: 'activites',
        eventType: 'Activités',
        price: '30€',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
        daysFromNow: 7,
        time: '14:00'
      },
      {
        title: 'Anniversaire Viking',
        description: 'Fête d\'anniversaire thématique avec lancer de hache et déguisements. Ambiance garantie.',
        category: 'activites',
        eventType: 'Activités',
        price: '28€',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
        daysFromNow: 10,
        time: '16:00'
      },
      {
        title: 'Tournoi de Haches',
        description: 'Compétition de lancer de hache avec classement et prix. Cibles digitales pour précision maximale.',
        category: 'activites',
        eventType: 'Activités',
        price: '32€',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
        daysFromNow: 14,
        time: '17:00'
      },
      {
        title: 'EVJF Warrior Girls',
        description: 'Enterrement de vie de jeune fille version guerrière. Session privée avec photos souvenirs.',
        category: 'activites',
        eventType: 'Activités',
        price: '33€',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
        daysFromNow: 17,
        time: '18:30'
      }
    ]
  },
  {
    id: 'musee-illusion-lyon',
    name: 'Musée de l\'Illusion Lyon',
    type: 'Musée interactif / Activité culturelle',
    description: 'Plus de 70 illusions sur 700m². Tunnel Vortex, salle des Miroirs, hologrammes, casse-têtes. Expérience ludique et éducative.',
    location: 'Grand Hôtel-Dieu, 69002 Lyon',
    email: 'musee@wouli-demo.fr',
    brandColor: '#16A085',
    features: ['events', 'stats', 'redirections', 'famille', 'educatif'],
    category: 'activity',
    events: [
      {
        title: 'Visite Découverte Famille',
        description: 'Découverte des 70+ illusions sur 700m². Tunnel Vortex, hologrammes et explications scientifiques.',
        category: 'activites',
        eventType: 'Activités',
        price: '16€',
        imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop',
        daysFromNow: 2,
        time: '14:00'
      },
      {
        title: 'Atelier Photos Insolites',
        description: 'Session photos créatives avec nos illusions. Repartez avec des souvenirs uniques et décalés.',
        category: 'activites',
        eventType: 'Activités',
        price: '20€',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
        daysFromNow: 5,
        time: '16:30'
      },
      {
        title: 'Escape Game Illusion',
        description: 'Escape game utilisant les illusions du musée. Résolvez les énigmes en famille ou entre amis.',
        category: 'activites',
        eventType: 'Activités',
        price: '24€',
        imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop',
        daysFromNow: 8,
        time: '15:00'
      },
      {
        title: 'Anniversaire Illusions',
        description: 'Fête d\'anniversaire magique avec parcours personnalisé. Salle des Miroirs et casse-têtes inclus.',
        category: 'activites',
        eventType: 'Activités',
        price: '22€',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
        daysFromNow: 11,
        time: '14:30'
      },
      {
        title: 'Soirée Adulte Mystère',
        description: 'Visite nocturne pour adultes avec explications scientifiques approfondies. Ambiance feutrée.',
        category: 'activites',
        eventType: 'Activités',
        price: '18€',
        imageUrl: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&h=600&fit=crop',
        daysFromNow: 15,
        time: '19:00'
      }
    ]
  }
];

// Instructions pour créer les comptes business
export const setupInstructions = `
## Instructions pour créer les 8 établissements lyonnais

### Étape 1: Utiliser /business/signup pour chaque établissement
Pour chaque établissement dans lyonEstablishments, créer un compte via la page /business/signup avec :

**Identifiants de connexion:**
- Email: [establishment.email]
- Mot de passe: demo2024

**Informations business:**
- Nom: [establishment.name]
- Type: [establishment.type] 
- Localisation: [establishment.location]
- Couleur de marque: [establishment.brandColor]
- Fonctionnalités: [establishment.features]

### Étape 2: Créer les événements
Une fois connecté dans chaque dashboard business, créer les événements listés dans establishment.events

### Étape 3: Test complet
- Vérifier l'affichage dans l'interface user (/app)
- Tester la recherche et les filtres
- Valider les interactions (likes, participations)

### Résultat attendu
- 8 établissements business fonctionnels
- 40+ événements répartis sur 3 semaines
- Toutes les catégories Wouli représentées
- Données réalistes pour les pilotes
`;