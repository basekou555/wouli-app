import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';
import { BusinessEvent } from '@/types/events';
import { friendshipService } from './friendshipService';

// Fonction utilitaire pour enrichir les événements avec les données sociales
const enrichEventsWithSocialData = async (events: UnifiedEvent[]): Promise<UnifiedEvent[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || events.length === 0) {
    return events;
  }

  // Enrichir chaque événement avec les données sociales
  const enrichedEvents = await Promise.all(
    events.map(async (event) => {
      try {
        const friendsResult = await friendshipService.getFriendsParticipatingInEvent(user.id, event.id);
        
        if (friendsResult.success) {
          const friendsParticipating = friendsResult.data.map(friend => ({
            id: friend.id,
            name: friend.username,
            avatar: friend.avatar_url || undefined
          }));

          return {
            ...event,
            friendsParticipating,
            totalParticipants: event.participants,
            // Déterminer si l'événement est urgent (dans les 4 prochaines heures)
            isUrgent: new Date(event.date).getTime() - Date.now() < 4 * 60 * 60 * 1000
          };
        }
      } catch (error) {
        console.warn(`Erreur enrichissement social pour événement ${event.id}:`, error);
      }
      
      return {
        ...event,
        friendsParticipating: [],
        totalParticipants: event.participants,
        isUrgent: new Date(event.date).getTime() - Date.now() < 4 * 60 * 60 * 1000
      };
    })
  );

  return enrichedEvents;
};

export const fetchAllEvents = async (): Promise<UnifiedEvent[]> => {
  // Utiliser la vue active_events pour récupérer seulement les événements actifs et futurs
  const { data: allEvents, error } = await supabase
    .from('active_events')
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

  const unifiedEvents = allEvents.map(event => ({
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
    source: (event.created_by_type === 'business' ? 'business' : 'user') as 'user' | 'business',
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
  } as UnifiedEvent));

  // Enrichir avec les données sociales
  return await enrichEventsWithSocialData(unifiedEvents);
};

export const fetchUserEvents = async (): Promise<UnifiedEvent[]> => {
  return fetchEventsByType('user');
};

export const fetchBusinessEvents = async (): Promise<UnifiedEvent[]> => {
  return fetchEventsByType('business');
};

const fetchEventsByType = async (type: 'user' | 'business'): Promise<UnifiedEvent[]> => {
  // Utiliser la vue active_events filtrée par type
  const { data: events, error } = await supabase
    .from('active_events')
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

  const unifiedEvents = events.map(event => ({
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
    source: type as 'user' | 'business',
    organizer: type === 'business' ? 
      (configMap.get(event.created_by) || 'Établissement') : 
      'Utilisateur',
    organizer_type: type as 'user' | 'business',
    venue: undefined,
    time: undefined,
    event_type: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    price_text: event.price ? event.price.toString() : undefined,
    end_date: event.end_date,
    max_participants: event.max_participants,
    address: event.address,
    tags: event.tags,
    external_url: event.external_url
  } as UnifiedEvent));

  // Enrichir avec les données sociales
  return await enrichEventsWithSocialData(unifiedEvents);
};

// Service pour les événements business - utilise la vue unifiée business_all_events
export const fetchBusinessEventsForDashboard = async (): Promise<BusinessEvent[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  // Utiliser la vue business_all_events avec owner_id
  const { data, error } = await supabase
    .from('business_all_events')
    .select('*')
    .eq('owner_id', user.id)
    .order('date', { ascending: false });

  if (error) throw error;
  
  // Map data to BusinessEvent format (source non exposée dans l'UI)
  const mappedEvents: BusinessEvent[] = (data || []).map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date?.split('T')[0] || '',
    time: event.time || '00:00',
    venue: event.location,
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
    user_id: event.owner_id
    // NOTE: event.source existe mais N'EST PAS exposé dans l'UI
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
      venue_id: user.id,
      title: eventData.title,
      description: eventData.description,
      date: `${eventData.date}T${eventData.time || '00:00'}:00`,
      location: eventData.venue || eventData.custom_venue || 'Lieu à définir',
      category: eventData.category,
      price: eventData.price ? parseFloat(eventData.price.replace('€', '')) : null,
      external_url: eventData.external_url,
      image_url: eventData.image_url,
      // Enriched fields for recommendations
      venue_category: eventData.venue_category || null,
      activity_type: eventData.activity_type || null,
      music_style: eventData.music_style || null,
      ambiance: eventData.ambiance || null,
      target_audience: eventData.target_audience || null,
      event_format: eventData.event_format || null,
      social_intensity: eventData.social_intensity || null
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
    user_id: data.created_by,
    venue_category: data.venue_category,
    activity_type: data.activity_type,
    music_style: data.music_style,
    ambiance: data.ambiance,
    target_audience: data.target_audience,
    event_format: data.event_format,
    social_intensity: data.social_intensity
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