import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';
import { BusinessEvent } from '@/types/events';

export const fetchAllEvents = async (): Promise<UnifiedEvent[]> => {
  const { data: allEvents, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.warn('Error fetching events:', error);
    return [];
  }

  if (!allEvents) return [];

  // Get business configs for organizer names
  const businessUserIds = [...new Set(
    allEvents
      .filter(event => event.created_by_type === 'business')
      .map(event => event.created_by)
  )];

  let configMap = new Map();
  if (businessUserIds.length > 0) {
    const { data: businessConfigs } = await supabase
      .from('business_configs')
      .select('user_id, client_name')
      .in('user_id', businessUserIds);
    
    configMap = new Map(
      businessConfigs?.map(config => [config.user_id, config.client_name]) || []
    );
  }

  return allEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    category: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    image_url: event.image_url,
    views: event.views || 0,
    likes: event.likes || 0,
    participants: event.participants || 0,
    created_at: event.created_at,
    updated_at: event.updated_at,
    source: event.created_by_type === 'business' ? 'business' : 'user',
    organizer: event.created_by_type === 'business' ? 
      (configMap.get(event.created_by) || 'Établissement') : 
      'Utilisateur',
    organizer_type: event.created_by_type as 'user' | 'business',
    venue: undefined,
    time: undefined,
    event_type: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    price_text: event.price ? event.price.toString() : undefined,
    end_date: event.end_date,
    max_participants: event.max_participants,
    address: event.address,
    tags: event.tags,
    external_url: event.external_url
  }));
};

export const fetchUserEvents = async (): Promise<UnifiedEvent[]> => {
  return fetchEventsByType('user');
};

export const fetchBusinessEvents = async (): Promise<UnifiedEvent[]> => {
  return fetchEventsByType('business');
};

const fetchEventsByType = async (type: 'user' | 'business'): Promise<UnifiedEvent[]> => {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by_type', type)
    .order('date', { ascending: true });

  if (error) {
    console.warn(`Error fetching ${type} events:`, error);
    return [];
  }

  if (!events) return [];

  // Get business configs for organizer names if needed
  let configMap = new Map();
  if (type === 'business') {
    const userIds = [...new Set(events.map(event => event.created_by))];
    const { data: businessConfigs } = await supabase
      .from('business_configs')
      .select('user_id, client_name')
      .in('user_id', userIds);
    
    configMap = new Map(
      businessConfigs?.map(config => [config.user_id, config.client_name]) || []
    );
  }

  return events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date,
    location: event.location,
    category: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    image_url: event.image_url,
    views: event.views || 0,
    likes: event.likes || 0,
    participants: event.participants || 0,
    created_at: event.created_at,
    updated_at: event.updated_at,
    source: type,
    organizer: type === 'business' ? 
      (configMap.get(event.created_by) || 'Établissement') : 
      'Utilisateur',
    organizer_type: type,
    venue: undefined,
    time: undefined,
    event_type: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    price_text: event.price ? event.price.toString() : undefined,
    end_date: event.end_date,
    max_participants: event.max_participants,
    address: event.address,
    tags: event.tags,
    external_url: event.external_url
  }));
};

// Service pour les événements business (maintient compatibilité avec l'interface existante)
export const fetchBusinessEventsForDashboard = async (): Promise<BusinessEvent[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', user.id)
    .eq('created_by_type', 'business')
    .order('date', { ascending: true });

  if (error) throw error;
  
  // Map data to BusinessEvent format
  const mappedEvents: BusinessEvent[] = (data || []).map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.split('T')[0], // Extract date part only
    time: '00:00', // Default time since not in unified table
    venue: event.location, // Use location as venue
    category: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    event_type: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    price: event.price ? event.price.toString() : undefined,
    image_url: event.image_url,
    views: event.views || 0,
    likes: event.likes || 0,
    participants: event.participants || 0,
    created_at: event.created_at,
    updated_at: event.updated_at,
    external_url: event.external_url,
    user_id: event.created_by
  }));
  
  return mappedEvents;
};

export const createBusinessEvent = async (
  eventData: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>
): Promise<BusinessEvent> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      created_by: user.id,
      created_by_type: 'business',
      title: eventData.title,
      description: eventData.description,
      date: `${eventData.date}T${eventData.time || '00:00'}:00`,
      location: eventData.venue || eventData.custom_venue || 'Lieu à définir',
      category: eventData.category,
      price: eventData.price ? parseFloat(eventData.price.replace('€', '')) : null,
      external_url: eventData.external_url,
      image_url: eventData.image_url
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    date: data.date.split('T')[0],
    time: data.date.split('T')[1]?.split(':').slice(0, 2).join(':') || '00:00',
    venue: data.location,
    category: data.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    event_type: data.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    price: data.price ? data.price.toString() : undefined,
    image_url: data.image_url,
    views: data.views || 0,
    likes: data.likes || 0,
    participants: data.participants || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    external_url: data.external_url,
    user_id: data.created_by
  };
};

export const updateBusinessEvent = async (
  eventId: string,
  eventData: Partial<Omit<BusinessEvent, 'id' | 'user_id'>>
): Promise<BusinessEvent> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('events')
    .update({
      title: eventData.title,
      description: eventData.description,
      date: eventData.date && eventData.time ? 
        `${eventData.date}T${eventData.time}:00` : 
        eventData.date,
      location: eventData.venue || eventData.custom_venue,
      category: eventData.category,
      price: eventData.price ? parseFloat(eventData.price.replace('€', '')) : null,
      external_url: eventData.external_url,
      image_url: eventData.image_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)
    .eq('created_by', user.id)
    .eq('created_by_type', 'business')
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    date: data.date.split('T')[0],
    time: data.date.split('T')[1]?.split(':').slice(0, 2).join(':') || '00:00',
    venue: data.location,
    category: data.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    event_type: data.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    price: data.price ? data.price.toString() : undefined,
    image_url: data.image_url,
    views: data.views || 0,
    likes: data.likes || 0,
    participants: data.participants || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    external_url: data.external_url,
    user_id: data.created_by
  };
};

export const deleteBusinessEvent = async (eventId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('created_by', user.id)
    .eq('created_by_type', 'business');

  if (error) throw error;
};