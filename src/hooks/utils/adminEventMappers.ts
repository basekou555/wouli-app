import { UnifiedEvent } from '@/types/unified';

export interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_time?: string;
  location: string;
  address: string | null;
  category: string;
  price: number | null;
  external_url: string | null;
  submitter_email: string | null;
  status: string;
  created_at: string;
  validated_at?: string;
  image_url: string | null;
}

export const mapPendingEventToUnified = (pendingEvent: PendingEvent): UnifiedEvent => {
  return {
    id: pendingEvent.id,
    title: pendingEvent.title,
    description: pendingEvent.description,
    date: pendingEvent.date,
    location: pendingEvent.location,
    category: pendingEvent.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    image_url: pendingEvent.image_url,
    views: 0, // Default for pending events
    likes: 0, // Default for pending events
    participants: 0, // Default for pending events
    created_at: pendingEvent.created_at,
    updated_at: pendingEvent.created_at,
    source: 'user',
    organizer: pendingEvent.submitter_email || 'Utilisateur',
    organizer_type: 'user',
    end_date: pendingEvent.end_time,
    price_text: pendingEvent.price ? `${pendingEvent.price}€` : undefined,
    address: pendingEvent.address,
    external_url: pendingEvent.external_url,
    
    // Wouli enhancements for admin preview
    isUrgent: new Date(pendingEvent.date) < new Date(Date.now() + 4 * 60 * 60 * 1000),
    friendsParticipating: [], // Empty for admin view
    totalParticipants: 0 // Default for pending events
  };
};