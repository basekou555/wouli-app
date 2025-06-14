
import { BusinessEvent } from '@/types/events';

// Configuration de démonstration pour différents types d'établissements
export const demoBusinessConfigs = [
  {
    id: 'demo-bar-1',
    client_name: 'Blue Note Bar',
    client_type: 'Bar/Restaurant',
    location: 'Lyon - Presqu\'île',
    brand_color: '#FF7A1F',
    features: ['events', 'stats', 'redirections'],
    user_id: 'demo-user-1'
  },
  {
    id: 'demo-club-1',
    client_name: 'Club Nyx',
    client_type: 'Boîte de Nuit',
    location: 'Lyon - Part-Dieu',
    brand_color: '#8B5CF6',
    features: ['events', 'stats', 'redirections', 'ranking'],
    user_id: 'demo-user-2'
  },
  {
    id: 'demo-gym-1',
    client_name: 'FitMax Gym',
    client_type: 'Salle de Sport',
    location: 'Lyon - Confluence',
    brand_color: '#10B981',
    features: ['events', 'stats', 'redirections', 'classes'],
    user_id: 'demo-user-3'
  }
];

// Événements de démonstration
export const demoBusinessEvents: BusinessEvent[] = [
  // Blue Note Bar - Events
  {
    id: 'demo-event-1',
    title: 'Soirée Jazz Live',
    description: 'Une soirée jazz intimiste avec le trio "Lyon Jazz Collective". Ambiance feutrée et cocktails signatures.',
    date: '2024-06-20',
    time: '20:00',
    location: 'Blue Note Bar',
    venue: 'Blue Note Bar',
    category: 'bar',
    event_type: 'À boire',
    price: '15€',
    image_url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop',
    views: 245,
    likes: 42,
    participants: 78,
    user_id: 'demo-user-1'
  },
  {
    id: 'demo-event-2',
    title: 'Happy Hour Cocktails',
    description: 'Tous les cocktails à -50% de 18h à 20h ! Découvrez nos créations originales dans une ambiance décontractée.',
    date: '2024-06-18',
    time: '18:00',
    location: 'Blue Note Bar',
    venue: 'Blue Note Bar',
    category: 'bar',
    event_type: 'À boire',
    price: '8€',
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
    views: 156,
    likes: 28,
    participants: 45,
    user_id: 'demo-user-1'
  },
  {
    id: 'demo-event-3',
    title: 'Dégustation Vins & Fromages',
    description: 'Soirée découverte avec notre sommelier. Sélection de vins locaux accompagnés de fromages d\'exception.',
    date: '2024-06-22',
    time: '19:30',
    location: 'Blue Note Bar',
    venue: 'Blue Note Bar',
    category: 'bar',
    event_type: 'À manger',
    price: '25€',
    image_url: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800&h=600&fit=crop',
    views: 189,
    likes: 35,
    participants: 32,
    user_id: 'demo-user-1'
  },

  // Club Nyx - Events
  {
    id: 'demo-event-4',
    title: 'Nyx Electronic Night',
    description: 'La plus grosse soirée électro de Lyon ! DJ internationaux, lightshow exceptionnel et ambiance survoltée.',
    date: '2024-06-21',
    time: '22:00',
    location: 'Club Nyx',
    venue: 'Club Nyx',
    category: 'club',
    event_type: 'Soirées',
    price: '20€',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    views: 892,
    likes: 156,
    participants: 234,
    user_id: 'demo-user-2'
  },
  {
    id: 'demo-event-5',
    title: 'Ladies Night',
    description: 'Soirée spéciale pour les femmes ! Entrée gratuite et cocktails offerts jusqu\'à minuit.',
    date: '2024-06-19',
    time: '21:00',
    location: 'Club Nyx',
    venue: 'Club Nyx',
    category: 'club',
    event_type: 'Soirées',
    price: 'Gratuit',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
    views: 445,
    likes: 89,
    participants: 167,
    user_id: 'demo-user-2'
  },

  // FitMax Gym - Events
  {
    id: 'demo-event-6',
    title: 'Cours de Yoga Sunrise',
    description: 'Commencez votre journée en douceur avec notre cours de yoga matinal. Tous niveaux bienvenus.',
    date: '2024-06-17',
    time: '07:00',
    location: 'FitMax Gym',
    venue: 'FitMax Gym',
    category: 'sport',
    event_type: 'Activités',
    price: '12€',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
    views: 123,
    likes: 34,
    participants: 28,
    user_id: 'demo-user-3'
  },
  {
    id: 'demo-event-7',
    title: 'CrossFit Challenge',
    description: 'Défi CrossFit inter-équipes ! Venez tester vos limites dans une ambiance conviviale et motivante.',
    date: '2024-06-23',
    time: '10:00',
    location: 'FitMax Gym',
    venue: 'FitMax Gym',
    category: 'sport',
    event_type: 'Activités',
    price: '15€',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    views: 267,
    likes: 67,
    participants: 45,
    user_id: 'demo-user-3'
  },
  {
    id: 'demo-event-8',
    title: 'Aqua Fitness Party',
    description: 'Cours d\'aqua fitness en musique ! Dépensez-vous dans l\'eau avec notre coach dynamique.',
    date: '2024-06-25',
    time: '19:00',
    location: 'FitMax Gym',
    venue: 'FitMax Gym',
    category: 'sport',
    event_type: 'Activités',
    price: '10€',
    image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
    views: 98,
    likes: 23,
    participants: 19,
    user_id: 'demo-user-3'
  }
];

// Fonction pour générer des statistiques réalistes
export const generateRealisticStats = (baseViews: number) => ({
  views: baseViews + Math.floor(Math.random() * 100),
  likes: Math.floor(baseViews * 0.15) + Math.floor(Math.random() * 20),
  participants: Math.floor(baseViews * 0.25) + Math.floor(Math.random() * 30),
  search_appearances: Math.floor(baseViews * 0.8) + Math.floor(Math.random() * 50)
});

// Données pour les profils de démonstration
export const demoProfiles = [
  {
    id: 'demo-user-1',
    username: 'blue_note_lyon',
    type: 'business',
    bio: 'Bar jazz authentique au cœur de Lyon. Cocktails signatures et concerts live.',
    city: 'Lyon',
    website: 'www.bluenote-lyon.fr'
  },
  {
    id: 'demo-user-2',
    username: 'club_nyx_official',
    type: 'business',
    bio: 'Le temple de la nuit lyonnaise. Soirées électro inoubliables depuis 2015.',
    city: 'Lyon',
    website: 'www.club-nyx.com'
  },
  {
    id: 'demo-user-3',
    username: 'fitmax_gym_lyon',
    type: 'business',
    bio: 'Votre salle de sport nouvelle génération. Cours collectifs et coaching personnalisé.',
    city: 'Lyon',
    website: 'www.fitmax-gym.fr'
  }
];

// Tags populaires pour les recherches
export const popularTags = [
  'jazz', 'cocktails', 'happy-hour', 'dégustation', 'vin',
  'électro', 'dj', 'soirée', 'danse', 'clubbing',
  'fitness', 'yoga', 'crossfit', 'aqua', 'sport',
  'lyon', 'presquile', 'partdieu', 'confluence',
  'musique', 'live', 'concert', 'ambiance'
];

export default {
  demoBusinessConfigs,
  demoBusinessEvents,
  demoProfiles,
  popularTags,
  generateRealisticStats
};
