
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
  capacity?: number;
  address?: string;
  tags?: string[];
  external_url?: string;
  
  // Wouli enhancements
  isUrgent?: boolean;
  friendsParticipating?: Friend[];
  totalParticipants?: number;
  
  // Établissement
  venue_logo?: string;
  venue_id?: string;
  
  // Business metrics
  conversion_rate?: number;
  
  // Image focus position for cropping
  image_focus_position?: 'top' | 'center' | 'bottom';
}

export type EventSource = 'user' | 'business' | 'all';
