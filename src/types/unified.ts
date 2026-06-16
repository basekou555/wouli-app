
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

  // --- Design système carte (Phase 1) ---
  // Énergie visuelle de la carte. Si fournie par le serveur, prioritaire sur deriveEnergy().
  energy?: 'SCENE' | 'CLUB' | 'JOURNEE';
  // Style musical (déjà présent en DB / BusinessEvent, exposé ici pour deriveEnergy()).
  music_style?: string;
  // Événement récurrent (déjà présent en DB / BusinessEvent).
  is_recurring?: boolean;
  // Événement ponctuel / exceptionnel → état UNIQUE.
  is_unique?: boolean;
  // Numéro d'édition pour les événements récurrents.
  edition_number?: number;
  // Couleur de carte fournie par le serveur (#RRGGBB) — prioritaire sur l'extraction canvas.
  color_card?: string;
}

export type EventSource = 'user' | 'business' | 'all';
