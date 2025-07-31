export interface Friend {
  id: string;
  name: string;
  avatar: string;
}

export interface Event {
  id: string;
  title: string;
  image_url?: string;
  date: string;
  time?: string;
  venue: string;
  price?: number;
  isFree: boolean;
  totalParticipants: number;
  friendsParticipating: Friend[];
  isUrgent: boolean;
  liked: boolean;
  participating: boolean;
  // Pour variante business
  views?: number;
  likes?: number;
  participants?: number;
  conversion_rate?: number;
}

export type EventCardVariant = 'swipe' | 'list' | 'business';