
import { useState, useEffect } from 'react';
import { EventSource, UnifiedEvent } from '@/types/unified';
import { ApiError } from '@/types/api';
import { fetchUserEvents, fetchBusinessEvents } from '@/services/eventService';
import { useSimpleEventInteractions } from '@/hooks/useSimpleEventInteractions';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';

export const useAllEvents = (source: EventSource = 'all') => {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allEvents: UnifiedEvent[] = [];

      // Fetch user events if needed
      if (source === 'all' || source === 'user') {
        const userEvents = await fetchUserEvents();
        allEvents.push(...userEvents);
      }

      // Fetch business events if needed
      if (source === 'all' || source === 'business') {
        const businessEvents = await fetchBusinessEvents();
        allEvents.push(...businessEvents);
      }

      // Sort all events by date
      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setEvents(allEvents);
    } catch (error) {
      handleError(error, 'fetchEvents');
      setEvents([]);
    } finally {
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
