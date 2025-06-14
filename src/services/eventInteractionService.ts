
import { supabase } from '@/integrations/supabase/client';

export const incrementEventViews = async (eventId: string, source: 'user' | 'business'): Promise<number | null> => {
  try {
    const tableName = source === 'user' ? 'events' : 'business_events';
    
    // First get the current views count
    const { data: currentEvent, error: fetchError } = await supabase
      .from(tableName)
      .select('views')
      .eq('id', eventId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Then update with incremented value
    const newViews = (currentEvent?.views || 0) + 1;
    const { error } = await supabase
      .from(tableName)
      .update({ views: newViews })
      .eq('id', eventId);
    
    if (error) throw error;

    return newViews;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return null;
  }
};

export const likeEventInDatabase = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    // Check if already liked to prevent duplicates
    const { data: existingLike } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      console.log('Event already liked by user');
      return false;
    }

    // Add the like
    const { error: likeError } = await supabase
      .from('event_likes')
      .insert({ event_id: eventId, user_id: userId });

    if (likeError) throw likeError;

    // Use RPC functions to update counters
    const { error: eventsRpcError } = await supabase
      .rpc('increment_event_likes_counter', { 
        event_id: eventId, 
        table_name: 'events' 
      });

    const { error: businessEventsRpcError } = await supabase
      .rpc('increment_event_likes_counter', { 
        event_id: eventId, 
        table_name: 'business_events' 
      });

    if (eventsRpcError) console.warn('Error updating events likes:', eventsRpcError);
    if (businessEventsRpcError) console.warn('Error updating business_events likes:', businessEventsRpcError);

    return true;
  } catch (error) {
    console.error('Error liking event:', error);
    return false;
  }
};

export const participateInEventDatabase = async (
  eventId: string, 
  userId: string, 
  status: 'going' | 'interested' = 'going'
): Promise<boolean> => {
  try {
    // Check if already participating to prevent duplicates
    const { data: existingParticipation } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existingParticipation) {
      console.log('User already participating in event');
      return false;
    }

    // Add the participation
    const { error: participationError } = await supabase
      .from('event_participants')
      .insert({ event_id: eventId, user_id: userId, status });

    if (participationError) throw participationError;

    // Use RPC functions to update counters
    const { error: eventsRpcError } = await supabase
      .rpc('increment_event_participants_counter', { 
        event_id: eventId, 
        table_name: 'events' 
      });

    const { error: businessEventsRpcError } = await supabase
      .rpc('increment_event_participants_counter', { 
        event_id: eventId, 
        table_name: 'business_events' 
      });

    if (eventsRpcError) console.warn('Error updating events participants:', eventsRpcError);
    if (businessEventsRpcError) console.warn('Error updating business_events participants:', businessEventsRpcError);

    return true;
  } catch (error) {
    console.error('Error participating in event:', error);
    return false;
  }
};

export const getEventInteractionStatus = async (eventId: string, userId: string) => {
  try {
    const [likesResult, participantsResult] = await Promise.all([
      supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle()
    ]);

    return {
      hasLiked: !!likesResult.data,
      hasParticipated: !!participantsResult.data
    };
  } catch (error) {
    console.error('Error getting interaction status:', error);
    return {
      hasLiked: false,
      hasParticipated: false
    };
  }
};
