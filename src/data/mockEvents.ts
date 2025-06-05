
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
    title: 'Olympique Lyonnais vs PSG',
    date: '2024-06-20',
    time: '21:00',
    venue: 'Groupama Stadium',
    description: 'Choc au sommet de la Ligue 1 ! Venez supporter les Gones dans une ambiance électrique au Groupama Stadium. Match décisif pour la course au titre.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    participants: 156,
    category: 'sport',
    organizer: 'Olympique Lyonnais',
    tags: ['football', 'OL', 'PSG', 'stade', 'lyon'],
    price: '25€',
    maxParticipants: 500,
    views: 1247,
    likes: 89,
    searchAppearances: 234
  },
  {
    id: '2',
    title: 'Nuits Sonores 2024',
    date: '2024-05-28',
    time: '18:00',
    venue: 'Musée des Confluences',
    description: 'Festival emblématique de musiques électroniques et cultures digitales. Découvrez les talents émergents et confirmés dans un cadre architectural unique.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    participants: 89,
    category: 'concert',
    organizer: 'Nuits Sonores',
    tags: ['électro', 'festival', 'musique', 'confluence', 'lyon'],
    price: '45€',
    maxParticipants: 200,
    views: 2156,
    likes: 178,
    searchAppearances: 567
  },
  {
    id: '3',
    title: 'Fête des Lumières - Presqu\'île',
    date: '2024-12-08',
    time: '19:00',
    venue: 'Place Bellecour',
    description: 'Événement magique unique au monde ! Déambulation nocturne à travers les installations lumineuses du centre-ville lyonnais. Tradition séculaire.',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
    participants: 324,
    category: 'culture',
    organizer: 'Ville de Lyon',
    tags: ['lumières', 'spectacle', 'lyon', 'tradition', 'nocturne'],
    views: 3421,
    likes: 267,
    searchAppearances: 892
  },
  {
    id: '4',
    title: 'Lou Wine Festival',
    date: '2024-06-15',
    time: '14:00',
    venue: 'Parc de la Tête d\'Or',
    description: 'Festival œnologique au cœur de Lyon ! Dégustations de vins locaux et concerts acoustiques dans le magnifique Parc de la Tête d\'Or.',
    image: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=800&h=600&fit=crop',
    participants: 67,
    category: 'restaurant',
    organizer: 'Lou Wine',
    tags: ['vin', 'dégustation', 'parc', 'acoustique', 'lyon'],
    price: '20€',
    maxParticipants: 150,
    views: 892,
    likes: 45,
    searchAppearances: 156
  },
  {
    id: '5',
    title: 'Marché des Créateurs - Croix-Rousse',
    date: '2024-06-22',
    time: '10:00',
    venue: 'Plateau de la Croix-Rousse',
    description: 'Marché artisanal créatif sur les pentes de la Croix-Rousse. Mode éthique, bijoux uniques et art local dans l\'atmosphère authentique des canuts.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    participants: 23,
    category: 'shopping',
    organizer: 'Collectif Croix-Rousse',
    tags: ['artisanat', 'créateurs', 'mode', 'croix-rousse', 'lyon'],
    views: 567,
    likes: 34,
    searchAppearances: 89
  },
  {
    id: '6',
    title: 'Afterwork Rooftop Part-Dieu',
    date: '2024-06-18',
    time: '18:30',
    venue: 'Sky Bar Part-Dieu',
    description: 'Afterwork exceptionnel avec vue panoramique sur Lyon ! Cocktails signatures, DJ sets et networking dans l\'ambiance du quartier d\'affaires.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop',
    participants: 78,
    category: 'bar',
    organizer: 'Sky Bar Part-Dieu',
    tags: ['afterwork', 'rooftop', 'cocktails', 'part-dieu', 'networking'],
    price: '12€',
    views: 1034,
    likes: 67,
    searchAppearances: 203
  },
  {
    id: '7',
    title: 'Concert Jazz - Subsistances',
    date: '2024-06-25',
    time: '20:30',
    venue: 'Les Subsistances',
    description: 'Soirée jazz intimiste aux Subsistances. Découvrez le quintet lyonnais "Rhône Jazz Collective" dans ce lieu culturel emblématique du 9ème.',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop',
    participants: 45,
    category: 'concert',
    organizer: 'Les Subsistances',
    tags: ['jazz', 'intimiste', 'subsistances', 'concert', 'lyon'],
    price: '18€',
    maxParticipants: 80,
    views: 678,
    likes: 42,
    searchAppearances: 134
  },
  {
    id: '8',
    title: 'Tournoi de Pétanque - Confluence',
    date: '2024-06-29',
    time: '15:00',
    venue: 'Rives de Saône',
    description: 'Tournoi de pétanque convivial sur les rives de Saône ! Ambiance guinguette, pastis et joie de vivre lyonnaise au programme.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
    participants: 32,
    category: 'sport',
    organizer: 'Club Confluence',
    tags: ['pétanque', 'tournoi', 'saône', 'convivial', 'lyon'],
    views: 445,
    likes: 28,
    searchAppearances: 76
  }
];
