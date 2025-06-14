
export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  website?: string;
  type: 'user' | 'business';
  created_at: string;
  updated_at?: string;
}

export interface UserStats {
  eventsParticipated: number;
  eventsLiked: number;
  eventsCreated: number;
  weeklyActivity: number;
}

export interface UserActivity {
  id: string;
  type: 'participation' | 'like' | 'creation';
  event: string;
  venue: string;
  date: string;
}
