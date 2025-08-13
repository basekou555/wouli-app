
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';

// Valid categories based on the new Wouli categories
const VALID_CATEGORIES = [
  'a-boire', 'a-manger', 'soirees', 'activites'
] as const;

type ValidCategory = typeof VALID_CATEGORIES[number];

const isValidCategory = (category: string): category is ValidCategory => {
  return VALID_CATEGORIES.includes(category as ValidCategory);
};

export const incrementSearchAppearances = async (eventIds: string[]): Promise<void> => {
  try {
    // Use a simple approach - update each event individually
    for (const eventId of eventIds) {
      // Try to increment in events table
      const { data: eventExists } = await supabase
        .from('events')
        .select('id, search_appearances')
        .eq('id', eventId)
        .single();

      if (eventExists) {
        await supabase
          .from('events')
          .update({ search_appearances: (eventExists.search_appearances || 0) + 1 })
          .eq('id', eventId);
      }
    }
  } catch (error) {
    console.error('Error incrementing search appearances:', error);
  }
};

export const searchEvents = async (
  query: string,
  category?: string,
  source: 'all' | 'user' | 'business' = 'all'
): Promise<UnifiedEvent[]> => {
  try {
    const allEvents: UnifiedEvent[] = [];

    // Validate category if provided
    const validCategory = category && isValidCategory(category) ? category : undefined;

    // Search in events table
    if (source === 'all' || source === 'user') {
      let eventsQuery = supabase
        .from('events')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
        .order('date', { ascending: true });

      if (validCategory) {
        eventsQuery = eventsQuery.eq('category', validCategory);
      }

      const { data: userEvents, error: userError } = await eventsQuery;

      if (userError) {
        console.warn('Error searching user events:', userError);
      } else {
        // Map to UnifiedEvent format
        const mappedUserEvents: UnifiedEvent[] = (userEvents || []).map(event => ({
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
        allEvents.push(...mappedUserEvents);
      }
    }

    // Search in business_events table
    if (source === 'all' || source === 'business') {
      let businessQuery = supabase
        .from('business_events')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,venue.ilike.%${query}%`)
        .order('date', { ascending: true });

      if (validCategory) {
        businessQuery = businessQuery.eq('category', validCategory);
      }

      const { data: businessEvents, error: businessError } = await businessQuery;

      if (businessError) {
        console.warn('Error searching business events:', businessError);
      } else {
        // Get business configs for organizer names
        const userIds = [...new Set((businessEvents || []).map(event => event.user_id))];
        const { data: businessConfigs } = await supabase
          .from('business_configs')
          .select('user_id, client_name')
          .in('user_id', userIds);

        const configMap = new Map(
          businessConfigs?.map(config => [config.user_id, config.client_name]) || []
        );

        // Map to UnifiedEvent format
        const mappedBusinessEvents: UnifiedEvent[] = (businessEvents || []).map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: `${event.date}T${event.time}`,
          location: event.venue,
          category: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
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
          event_type: event.event_type as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
          price_text: event.price
        }));
        allEvents.push(...mappedBusinessEvents);
      }
    }

    // Increment search appearances for found events
    const eventIds = allEvents.map(event => event.id);
    if (eventIds.length > 0) {
      await incrementSearchAppearances(eventIds);
    }

    return allEvents;
  } catch (error) {
    console.error('Error searching events:', error);
    return [];
  }
};
