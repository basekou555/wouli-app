import { useState, useEffect } from 'react';
import { mockEventsWithFriends, EventWithFriends } from '@/data/mockEventsWithFriends';
import { useSimpleEventInteractions } from './useSimpleEventInteractions';

export const useAllEventsWithFriends = () => {
  const [events, setEvents] = useState<EventWithFriends[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { handleIncrementViews, handleLike, handleParticipate } = useSimpleEventInteractions();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setEvents(mockEventsWithFriends);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setEvents(mockEventsWithFriends);
      setLoading(false);
    }, 300);
  };

  return {
    events,
    loading,
    error,
    refetch,
    handleIncrementViews,
    handleLike,
    handleParticipate,
    clearError: () => setError(null)
  };
};