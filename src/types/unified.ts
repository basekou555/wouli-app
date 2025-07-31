
import { BaseEvent, UserEvent, BusinessEvent } from './events';

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
}

export interface UnifiedEvent extends BaseEvent {
  source: 'user' | 'business';
  organizer: string;
  organizer_type: 'user' | 'business';
  venue?: string;
  time?: string;
  event_type?: 'a-boire' | 'a-manger' | 'soirees' | 'activites';
  price_text?: string;
  end_date?: string;
  max_participants?: number;
  address?: string;
  tags?: string[];
  external_url?: string;
  
  // Wouli enhancements
  isUrgent?: boolean;
  friendsParticipating?: Friend[];
  totalParticipants?: number;
  
  // Business metrics
  conversion_rate?: number;
}

export type EventSource = 'user' | 'business' | 'all';
