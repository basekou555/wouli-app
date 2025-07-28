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
  {
    id: 'event-1',
    title: 'Concert Jazz au Sunset',
    description: 'Venez découvrir les meilleurs talents du jazz parisien dans une ambiance feutrée.',
    date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Dans 2h (urgent)
    time: '21:00',
    location: 'Le Sunset, 60 rue des Lombards, 75001 Paris',
    category: 'soirees',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop',
    views: 156,
    likes: 34,
    participants: 47,
    source: 'business',
    organizer: 'Le Sunset',
    organizer_type: 'business',
    price_text: '25€',
    friendsParticipating: [
      { name: 'Paul', avatar: 'https://i.pravatar.cc/40?img=1', id: '1' },
      { name: 'Sarah', avatar: 'https://i.pravatar.cc/40?img=2', id: '2' }
    ]
  },
  {
    id: 'event-2',
    title: 'Brunch dominical',
    description: 'Brunch gourmand avec vue sur le Rhône.',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain
    time: '11:00',
    location: 'Café de la Place, Lyon',
    category: 'a-manger',
    image_url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=500&fit=crop',
    views: 89,
    likes: 23,
    participants: 15,
    source: 'user',
    organizer: 'Marie D.',
    organizer_type: 'user',
    price_text: 'Gratuit',
    friendsParticipating: []
  },
  {
    id: 'event-3',
    title: 'Soirée DJ au Sucre',
    description: 'Nuit électro avec les meilleurs DJs de la région.',
    date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Ce soir
    time: '23:00',
    location: 'Le Sucre, Lyon',
    category: 'soirees',
    image_url: 'https://images.unsplash.com/photo-1571266028243-d220c9fa7203?w=400&h=500&fit=crop',
    views: 234,
    likes: 67,
    participants: 89,
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
    id: 'event-4',
    title: 'Escape Game Mystère',
    description: 'Résolvez l\'énigme en 60 minutes chrono !',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
    time: '19:30',
    location: 'L\'Hachez-Vous, Lyon',
    category: 'activites',
    image_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=500&fit=crop',
    views: 45,
    likes: 12,
    participants: 0,
    source: 'business',
    organizer: 'L\'Hachez-Vous',
    organizer_type: 'business',
    price_text: '30€',
    friendsParticipating: []
  },
  {
    id: 'event-5',
    title: 'Happy Hour Rooftop',
    description: 'Cocktails avec vue panoramique sur Lyon.',
    date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Dans 30min (urgent)
    time: '18:00',
    location: 'Villa Florentine, Lyon',
    category: 'a-boire',
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=500&fit=crop',
    views: 178,
    likes: 45,
    participants: 23,
    source: 'business',
    organizer: 'Villa Florentine',
    organizer_type: 'business',
    price_text: '12€',
    friendsParticipating: [
      { name: 'Emma', avatar: 'https://i.pravatar.cc/40?img=6', id: '6' }
    ]
  },
  {
    id: 'event-6',
    title: 'Exposition Art Contemporain',
    description: 'Découverte des nouveaux talents lyonnais.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 1 semaine
    time: '14:00',
    location: 'Musée des illusions, Lyon',
    category: 'activites',
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop',
    views: 67,
    likes: 18,
    participants: 34,
    source: 'user',
    organizer: 'Collectif ArtLy',
    organizer_type: 'user',
    price_text: 'Gratuit',
    friendsParticipating: [
      { name: 'Léa', avatar: 'https://i.pravatar.cc/40?img=7', id: '7' },
      { name: 'Marc', avatar: 'https://i.pravatar.cc/40?img=8', id: '8' }
    ]
  }
];

export default mockEventsWithFriends;