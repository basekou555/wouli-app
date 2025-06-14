
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';

export const fetchUserEvents = async (): Promise<UnifiedEvent[]> => {
  const { data: userEvents, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.warn('Error fetching user events:', error);
    return [];
  }

  if (!userEvents) return [];

  return userEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    category: event.category,
    image_url: event.image_url,
    views: event.views || 0,
    likes: event.likes || 0,
    participants: event.participants || 0,
    created_at: event.created_at,
    updated_at: event.updated_at,
    source: 'user',
    organizer: 'Utilisateur',
    organizer_type: 'user',
    end_date: event.end_date,
    price_text: event.price ? `${event.price}€` : undefined,
    max_participants: event.max_participants,
    address: event.address,
    tags: event.tags,
    external_url: event.external_url
  }));
};

export const fetchBusinessEvents = async (): Promise<UnifiedEvent[]> => {
  // First get business events
  const { data: businessEvents, error: businessError } = await supabase
    .from('business_events')
    .select('*')
    .order('date', { ascending: true });

  if (businessError) {
    console.warn('Error fetching business events:', businessError);
    return [];
  }

  if (!businessEvents) return [];

  // Then get business configs for organizer names
  const userIds = [...new Set(businessEvents.map(event => event.user_id))];
  const { data: businessConfigs, error: configError } = await supabase
    .from('business_configs')
    .select('user_id, client_name')
    .in('user_id', userIds);

  if (configError) {
    console.warn('Error fetching business configs:', configError);
  }

  // Create a map for quick lookup
  const configMap = new Map(
    businessConfigs?.map(config => [config.user_id, config.client_name]) || []
  );

  return businessEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: `${event.date}T${event.time}`,
    location: event.venue,
    category: event.category,
    image_url: event.image_url,
    views: event.views || 0,
    likes: event.likes || 0,
    participants: event.participants || 0,
    created_at: event.created_at,
    updated_at: event.updated_at,
    source: 'business',
    organizer: configMap.get(event.user_id) || 'Établissement',
    organizer_type: 'business',
    venue: event.venue,
    time: event.time,
    event_type: event.event_type,
    price_text: event.price
  }));
};
