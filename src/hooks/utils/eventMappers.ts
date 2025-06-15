
import { UnifiedEvent } from '@/types/unified';

export const mapBusinessEventToUnified = (businessEvent: any): UnifiedEvent => {
  return {
    id: businessEvent.id,
    title: businessEvent.title,
    description: businessEvent.description,
    date: `${businessEvent.date}T${businessEvent.time}`,
    location: businessEvent.venue || businessEvent.custom_venue || 'Lieu non spécifié',
    category: businessEvent.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    image_url: businessEvent.image_url,
    views: businessEvent.views || 0,
    likes: businessEvent.likes || 0,
    participants: businessEvent.participants || 0,
    created_at: businessEvent.created_at,
    updated_at: businessEvent.updated_at,
    source: 'business',
    organizer: 'Établissement',
    organizer_type: 'business',
    venue: businessEvent.venue,
    time: businessEvent.time,
    event_type: businessEvent.event_type as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    price_text: businessEvent.price,
    external_url: businessEvent.external_url
  };
};

export const mapUserEventToUnified = (userEvent: any): UnifiedEvent => {
  return {
    id: userEvent.id,
    title: userEvent.title,
    description: userEvent.description,
    date: userEvent.date,
    location: userEvent.location,
    category: userEvent.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    image_url: userEvent.image_url,
    views: userEvent.views || 0,
    likes: userEvent.likes || 0,
    participants: userEvent.participants || 0,
    created_at: userEvent.created_at,
    updated_at: userEvent.updated_at,
    source: 'user',
    organizer: 'Utilisateur',
    organizer_type: 'user',
    end_date: userEvent.end_date,
    price_text: userEvent.price ? `${userEvent.price}€` : undefined,
    max_participants: userEvent.max_participants,
    address: userEvent.address,
    tags: userEvent.tags,
    external_url: userEvent.external_url
  };
};
