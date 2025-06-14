
export interface BaseEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  category: 'a-boire' | 'a-manger' | 'soirees' | 'activites';
  image_url?: string;
  views: number;
  likes: number;
  participants: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserEvent extends BaseEvent {
  end_date?: string;
  price?: number;
  max_participants?: number;
  address?: string;
  tags?: string[];
  external_url?: string;
  created_by: string;
  created_by_type: 'user' | 'business';
}

export interface BusinessEvent extends BaseEvent {
  time: string;
  venue?: string;
  custom_venue?: string;
  event_type: 'a-boire' | 'a-manger' | 'soirees' | 'activites';
  price?: string;
  external_url?: string;
  user_id: string;
}

export interface EventInteraction {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
}

export interface EventLike extends EventInteraction {}

export interface EventParticipant extends EventInteraction {
  status: 'going' | 'interested';
}
