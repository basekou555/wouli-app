
import { supabase } from '@/integrations/supabase/client';
import { BusinessEvent } from '@/types/events';
import { createApiError } from '@/hooks/utils/errorHandling';

export const fetchBusinessEvents = async (): Promise<BusinessEvent[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Return mock data if not authenticated
    return [
      {
        id: '1',
        title: 'Soirée Jazz',
        description: 'Une soirée jazz intimiste',
        date: '2025-06-14',
        time: '20:00',
        location: 'Blue Note Bar',
        venue: 'Blue Note Bar',
        category: 'a-boire',
        event_type: 'a-boire',
        price: '15€',
        views: 120,
        likes: 25,
        participants: 45,
        user_id: 'mock'
      },
      {
        id: '2',
        title: 'Happy Hour',
        description: 'Cocktails à prix réduit',
        date: '2025-06-15',
        time: '18:00',
        location: 'Blue Note Bar',
        venue: 'Blue Note Bar',
        category: 'a-boire',
        event_type: 'a-boire',
        price: '8€',
        views: 89,
        likes: 18,
        participants: 32,
        user_id: 'mock'
      }
    ];
  }

  const { data, error } = await supabase
    .from('business_events')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  if (error) throw error;
  
  // Map Supabase data to BusinessEvent type with proper type casting
  const mappedEvents: BusinessEvent[] = (data || []).map(event => ({
    ...event,
    location: event.custom_venue || event.venue || 'Lieu à définir',
    category: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    event_type: event.event_type as 'a-boire' | 'a-manger' | 'soirees' | 'activites'
  }));
  
  return mappedEvents;
};

export const createBusinessEvent = async (
  eventData: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>
): Promise<BusinessEvent> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Return mock event for non-authenticated users
    return {
      id: Math.random().toString(),
      ...eventData,
      views: 0,
      likes: 0,
      participants: 0,
      user_id: 'mock'
    };
  }

  const { data, error } = await supabase
    .from('business_events')
    .insert({
      user_id: user.id,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      venue: eventData.venue,
      custom_venue: eventData.custom_venue,
      category: eventData.category,
      event_type: eventData.event_type,
      price: eventData.price,
      external_url: eventData.external_url,
      image_url: eventData.image_url,
      views: 0,
      likes: 0,
      participants: 0
    })
    .select()
    .single();

  if (error) throw error;

  // Map the returned data to BusinessEvent type with proper type casting
  return {
    ...data,
    location: data.custom_venue || data.venue || 'Lieu à définir',
    category: data.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    event_type: data.event_type as 'a-boire' | 'a-manger' | 'soirees' | 'activites'
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
    .from('business_events')
    .update({
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      venue: eventData.venue,
      custom_venue: eventData.custom_venue,
      category: eventData.category,
      event_type: eventData.event_type,
      price: eventData.price,
      external_url: eventData.external_url,
      image_url: eventData.image_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    location: data.custom_venue || data.venue || 'Lieu à définir',
    category: data.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
    event_type: data.event_type as 'a-boire' | 'a-manger' | 'soirees' | 'activites'
  };
};

export const deleteBusinessEvent = async (eventId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // For mock data, we just return without doing anything
    return;
  }

  const { error } = await supabase
    .from('business_events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
};
