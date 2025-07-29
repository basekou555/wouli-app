import { UnifiedEvent } from '@/types/unified';

interface Friend {
  name: string;
  avatar: string;
  id: string;
}

export interface EventWithFriends extends UnifiedEvent {
  friendsParticipating: Friend[];
}

export const mockEventsWithFriends: EventWithFriends[] = [
  // URGENT - Maintenant (moins de 1h)
  {
    id: 'event-urgent-1',
    title: 'Happy Hour Cocktails',
    description: 'Dernière chance ! Happy hour jusqu\'à 19h avec -50% sur tous les cocktails.',
    date: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Dans 15min
    time: '18:45',
    location: 'Les Salons du NH, Lyon 6e',
    category: 'a-boire',
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=500&fit=crop',
    views: 203,
    likes: 56,
    participants: 34,
    source: 'business',
    organizer: 'Les Salons du NH',
    organizer_type: 'business',
    price_text: '8€',
    friendsParticipating: [
      { name: 'Paul', avatar: 'https://i.pravatar.cc/40?img=1', id: '1' },
      { name: 'Sarah', avatar: 'https://i.pravatar.cc/40?img=2', id: '2' }
    ]
  },

  // URGENT - Dans 2h
  {
    id: 'event-urgent-2',
    title: 'Dégustation Vin & Fromages',
    description: 'Soirée dégustation avec un sommelier, dernières places disponibles.',
    date: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(), // Dans 2h30
    time: '20:30',
    location: 'Brume, Lyon 2e',
    category: 'a-manger',
    image_url: 'https://images.unsplash.com/photo-1558642891-54be180ea339?w=400&h=500&fit=crop',
    views: 89,
    likes: 23,
    participants: 12,
    source: 'business',
    organizer: 'Brume',
    organizer_type: 'business',
    price_text: '35€',
    friendsParticipating: [
      { name: 'Emma', avatar: 'https://i.pravatar.cc/40?img=6', id: '6' }
    ]
  },

  // CE SOIR
  {
    id: 'event-tonight-1',
    title: 'Soirée Électro au Sucre',
    description: 'Nuit électro avec Francky B2B Maxime, sur la terrasse avec vue Rhône.',
    date: new Date().toISOString().split('T')[0], // Aujourd'hui
    time: '23:00',
    location: 'Le Sucre, Villeurbanne',
    category: 'soirees',
    image_url: 'https://images.unsplash.com/photo-1571266028243-d220c9fa7203?w=400&h=500&fit=crop',
    views: 267,
    likes: 89,
    participants: 156,
    source: 'business',
    organizer: 'Le Sucre',
    organizer_type: 'business',
    price_text: '15€',
    friendsParticipating: [
      { name: 'Alex', avatar: 'https://i.pravatar.cc/40?img=3', id: '3' },
      { name: 'Julie', avatar: 'https://i.pravatar.cc/40?img=4', id: '4' },
      { name: 'Tom', avatar: 'https://i.pravatar.cc/40?img=5', id: '5' }
    ]
  },

  {
    id: 'event-tonight-2',
    title: 'Dîner Jazz Live',
    description: 'Concert jazz acoustique pendant le dîner, ambiance feutrée.',
    date: new Date().toISOString().split('T')[0], // Aujourd'hui
    time: '20:00',
    location: 'Dabali, Lyon 1er',
    category: 'soirees',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop',
    views: 134,
    likes: 41,
    participants: 28,
    source: 'business',
    organizer: 'Dabali',
    organizer_type: 'business',
    price_text: '45€',
    friendsParticipating: [
      { name: 'Léa', avatar: 'https://i.pravatar.cc/40?img=7', id: '7' }
    ]
  },

  // DEMAIN
  {
    id: 'event-tomorrow-1',
    title: 'Brunch & Mimosas',
    description: 'Brunch dominical avec vue sur Bellecour, cocktails sans limite.',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    time: '11:00',
    location: 'Le F&K, Lyon 2e',
    category: 'a-manger',
    image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=500&fit=crop',
    views: 178,
    likes: 67,
    participants: 89,
    source: 'business',
    organizer: 'Le F&K',
    organizer_type: 'business',
    price_text: '28€',
    friendsParticipating: [
      { name: 'Marc', avatar: 'https://i.pravatar.cc/40?img=8', id: '8' },
      { name: 'Paul', avatar: 'https://i.pravatar.cc/40?img=1', id: '1' }
    ]
  },

  // ÉVÉNEMENTS SANS AMIS (pour tester la logique)
  {
    id: 'event-no-friends-1',
    title: 'Escape Game Horreur',
    description: 'Nouveau parcours d\'épouvante, frissons garantis !',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: '19:30',
    location: 'L\'Hachez-Vous, Lyon 3e',
    category: 'activites',
    image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=500&fit=crop',
    views: 67,
    likes: 23,
    participants: 45,
    source: 'business',
    organizer: 'L\'Hachez-Vous',
    organizer_type: 'business',
    price_text: '32€',
    friendsParticipating: []
  },

  {
    id: 'event-no-friends-2',
    title: 'Visite Musée Interactif',
    description: 'Découvrez les illusions d\'optique les plus bluffantes.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '14:00',
    location: 'Musée des illusions, Lyon 2e',
    category: 'activites',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop',
    views: 234,
    likes: 78,
    participants: 12,
    source: 'business',
    organizer: 'Musée des illusions',
    organizer_type: 'business',
    price_text: '16€',
    friendsParticipating: []
  },

  // ÉVÉNEMENTS GRATUITS
  {
    id: 'event-free-1',
    title: 'Exposition Photo Street Art',
    description: 'Vernissage gratuit avec l\'artiste, drinks offerts.',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    time: '18:30',
    location: 'Galerie Slika, Lyon 4e',
    category: 'activites',
    image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=500&fit=crop',
    views: 156,
    likes: 67,
    participants: 89,
    source: 'user',
    organizer: 'Collectif ArtLy',
    organizer_type: 'user',
    price_text: 'Gratuit',
    friendsParticipating: [
      { name: 'Sarah', avatar: 'https://i.pravatar.cc/40?img=2', id: '2' },
      { name: 'Emma', avatar: 'https://i.pravatar.cc/40?img=6', id: '6' }
    ]
  },

  // ÉVÉNEMENT TRÈS POPULAIRE
  {
    id: 'event-popular-1',
    title: 'Soirée Rooftop Heat',
    description: 'After-work sur le plus beau rooftop de Lyon, DJ set et cocktails.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '19:00',
    location: 'Le Heat, Lyon 3e',
    category: 'soirees',
    image_url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=500&fit=crop',
    views: 445,
    likes: 134,
    participants: 267,
    source: 'business',
    organizer: 'Le Heat',
    organizer_type: 'business',
    price_text: '22€',
    friendsParticipating: [
      { name: 'Alex', avatar: 'https://i.pravatar.cc/40?img=3', id: '3' },
      { name: 'Julie', avatar: 'https://i.pravatar.cc/40?img=4', id: '4' }
    ]
  },

  // ÉVÉNEMENT PEU POPULAIRE (pour tester "Sois le premier")
  {
    id: 'event-unpopular-1',
    title: 'Dégustation Bières Artisanales',
    description: 'Découverte des brasseries locales avec le brasseur.',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    time: '20:00',
    location: 'Bario Club, Lyon 7e',
    category: 'a-boire',
    image_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=500&fit=crop',
    views: 23,
    likes: 8,
    participants: 3,
    source: 'business',
    organizer: 'Bario Club',
    organizer_type: 'business',
    price_text: '18€',
    friendsParticipating: []
  },

  // ÉVÉNEMENT UTILISATEUR
  {
    id: 'event-user-1',
    title: 'Pique-nique Parc Tête d\'Or',
    description: 'RDV près du lac pour un pique-nique entre amis, chacun amène quelque chose !',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '12:00',
    location: 'Parc de la Tête d\'Or, Lyon 6e',
    category: 'activites',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
    views: 89,
    likes: 34,
    participants: 23,
    source: 'user',
    organizer: 'Marie D.',
    organizer_type: 'user',
    price_text: 'Gratuit',
    friendsParticipating: [
      { name: 'Tom', avatar: 'https://i.pravatar.cc/40?img=5', id: '5' },
      { name: 'Léa', avatar: 'https://i.pravatar.cc/40?img=7', id: '7' },
      { name: 'Marc', avatar: 'https://i.pravatar.cc/40?img=8', id: '8' }
    ]
  }
];

export default mockEventsWithFriends;