
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
    const { error } = await supabase
      .from('event_likes')
      .insert({ event_id: eventId, user_id: userId });

    if (error) throw error;
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
    const { error } = await supabase
      .from('event_participants')
      .insert({ event_id: eventId, user_id: userId, status });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error participating in event:', error);
    return false;
  }
};
