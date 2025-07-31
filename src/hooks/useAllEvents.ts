
import { useState, useEffect } from 'react';
import { EventSource, UnifiedEvent } from '@/types/unified';
import { ApiError } from '@/types/api';
import { fetchAllEvents, fetchUserEvents, fetchBusinessEvents } from '@/services/unifiedEventService';
import { useSimpleEventInteractions } from '@/hooks/useSimpleEventInteractions';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { mockEventsWithFriends } from '@/data/mockEventsWithFriends';

export const useAllEvents = (source: EventSource = 'all') => {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use real database events
      let allEvents: UnifiedEvent[] = [];

      if (source === 'all') {
        allEvents = await fetchAllEvents();
      } else if (source === 'user') {
        allEvents = await fetchUserEvents();
      } else if (source === 'business') {
        allEvents = await fetchBusinessEvents();
      }

      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(allEvents);
      setLoading(false);
    } catch (error) {
      handleError(error, 'fetchEvents');
      setEvents([]);
      setLoading(false);
    }
  };

  const { handleIncrementViews, handleLike, handleParticipate } = useSimpleEventInteractions();
  
  // Enable real-time updates
  useRealTimeEvents(events, setEvents);

  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    const apiError: ApiError = {
      message: error.message || 'Une erreur inattendue s\'est produite',
      code: error.code,
      details: error
    };
    setError(apiError);
    return apiError;
  };

  useEffect(() => {
    fetchEvents();
  }, [source]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    incrementViews: handleIncrementViews,
    likeEvent: handleLike,
    participateEvent: handleParticipate,
    clearError: () => setError(null)
  };
};
