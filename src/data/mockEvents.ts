
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image: string;
  participants: number;
  category: string;
  organizer: string;
  tags: string[];
  price?: string;
  maxParticipants?: number;
  views: number;
  likes: number;
  searchAppearances: number;
}

export const categories = [
  { id: 'all', name: 'Tous', icon: '🎉' },
  { id: 'bar', name: 'Bars & Pubs', icon: '🍺' },
  { id: 'restaurant', name: 'Restaurants', icon: '🍽️' },
  { id: 'concert', name: 'Concerts', icon: '🎵' },
  { id: 'sport', name: 'Sport', icon: '⚽' },
  { id: 'culture', name: 'Culture', icon: '🎭' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Soirée Jazz au Blue Note',
    date: '2024-06-15',
    time: '21:00',
    venue: 'Blue Note Bar',
    description: 'Une soirée jazz intimiste avec des musiciens locaux dans une ambiance feutrée. Venez découvrir les talents émergents de la scène jazz lyonnaise.',
    image: 'https://picsum.photos/400/300?random=1',
    participants: 45,
    category: 'concert',
    organizer: 'Blue Note Bar',
    tags: ['jazz', 'musique', 'soirée', 'ambiance'],
    price: '15€',
    maxParticipants: 80,
    views: 234,
    likes: 18,
    searchAppearances: 67
  },
  {
    id: '2',
    title: 'Happy Hour Cocktails',
    date: '2024-06-16',
    time: '18:00',
    venue: 'Blue Note Bar',
    description: 'Profitez de nos cocktails signature à prix réduit de 18h à 20h. Ambiance décontractée garantie !',
    image: 'https://picsum.photos/400/300?random=2',
    participants: 23,
    category: 'bar',
    organizer: 'Blue Note Bar',
    tags: ['cocktails', 'happy hour', 'afterwork'],
    price: '8€',
    views: 145,
    likes: 12,
    searchAppearances: 34
  },
  {
    id: '3',
    title: 'Tournoi de Pétanque',
    date: '2024-06-20',
    time: '14:00',
    venue: 'Café des Sports',
    description: 'Venez participer à notre tournoi de pétanque amical ! Inscription gratuite, lots à gagner.',
    image: 'https://picsum.photos/400/300?random=3',
    participants: 16,
    category: 'sport',
    organizer: 'Café des Sports',
    tags: ['pétanque', 'tournoi', 'sport', 'convivial'],
    views: 89,
    likes: 7,
    searchAppearances: 23
  },
  {
    id: '4',
    title: 'Dégustation Vins & Fromages',
    date: '2024-06-22',
    time: '19:30',
    venue: 'Le Comptoir du Rhône',
    description: 'Découvrez les accords parfaits entre vins de la région et fromages sélectionnés par notre sommelier.',
    image: 'https://picsum.photos/400/300?random=4',
    participants: 12,
    category: 'restaurant',
    organizer: 'Le Comptoir du Rhône',
    tags: ['vin', 'fromage', 'dégustation', 'gastronomie'],
    price: '25€',
    maxParticipants: 20,
    views: 156,
    likes: 14,
    searchAppearances: 41
  },
  {
    id: '5',
    title: 'Soirée Karaoké',
    date: '2024-06-25',
    time: '21:30',
    venue: 'Pub O\'Sullivan\'s',
    description: 'Montez sur scène et chantez vos tubes préférés ! Soirée karaoké tous les vendredis.',
    image: 'https://picsum.photos/400/300?random=5',
    participants: 31,
    category: 'bar',
    organizer: 'Pub O\'Sullivan\'s',
    tags: ['karaoké', 'chant', 'soirée', 'fun'],
    views: 198,
    likes: 22,
    searchAppearances: 58
  },
  {
    id: '6',
    title: 'Match de Foot sur Écran Géant',
    date: '2024-06-18',
    time: '21:00',
    venue: 'Sports Bar Lyon',
    description: 'Venez supporter votre équipe favorite devant notre écran géant ! Ambiance stade garantie.',
    image: 'https://picsum.photos/400/300?random=6',
    participants: 67,
    category: 'sport',
    organizer: 'Sports Bar Lyon',
    tags: ['football', 'sport', 'écran géant', 'supporters'],
    views: 312,
    likes: 28,
    searchAppearances: 94
  }
];
