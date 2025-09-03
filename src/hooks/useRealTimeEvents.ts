
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';

export const useRealTimeEvents = (
  events: UnifiedEvent[],
  setEvents: React.Dispatch<React.SetStateAction<UnifiedEvent[]>>
) => {
  useEffect(() => {
    // Subscribe to business_events changes for real-time updates
    const businessEventsChannel = supabase
      .channel('business_events_' + Math.random().toString(36).substr(2, 9))
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'business_events'
        },
        (payload) => {
          console.log('Business events change detected:', payload);
          // Refresh events when changes occur
          // This will be handled by the parent component's refetch
        }
      )
      .subscribe();

    // Subscribe to event interactions for real-time stats updates
    const likesChannel = supabase
      .channel('event_likes_' + Math.random().toString(36).substr(2, 9))
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_likes'
        },
        (payload) => {
          console.log('New like detected:', payload);
          // Update local state with new like count
          const eventId = payload.new.event_id;
          setEvents(prev => prev.map(event => 
            event.id === eventId 
              ? { ...event, likes: (event.likes || 0) + 1 }
              : event
          ));
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel('event_participants_' + Math.random().toString(36).substr(2, 9))
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_participants'
        },
        (payload) => {
          console.log('New participation detected:', payload);
          // Update local state with new participant count
          const eventId = payload.new.event_id;
          setEvents(prev => prev.map(event => 
            event.id === eventId 
              ? { ...event, participants: (event.participants || 0) + 1 }
              : event
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(businessEventsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [setEvents]);
};
