
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BusinessEvent } from '@/types/events';
import { ApiError } from '@/types/api';
import { createApiError } from './utils/errorHandling';
import { fetchBusinessEvents, createBusinessEvent, deleteBusinessEvent } from '@/services/businessEventsService';
import { UseBusinessEventsReturn, CreateEventData } from './types/businessEvents';
import { useBusinessEventActions } from './business/useBusinessEventActions';

export const useBusinessEvents = (): UseBusinessEventsReturn => {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

  const { createEventAction, deleteEventAction } = useBusinessEventActions(events, setEvents, setError, toast);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedEvents = await fetchBusinessEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      const apiError = createApiError(error, 'fetchEvents');
      setError(apiError);
      // Fallback to empty array instead of showing error immediately
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    createEvent: createEventAction,
    deleteEvent: deleteEventAction,
    refetch: fetchEvents,
    clearError: () => setError(null)
  };
};
