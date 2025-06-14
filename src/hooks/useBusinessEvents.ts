
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BusinessEvent } from '@/types/events';
import { ApiError } from '@/types/api';
import { createApiError } from './utils/errorHandling';
import { fetchBusinessEvents, createBusinessEvent, deleteBusinessEvent } from '@/services/businessEventsService';
import { UseBusinessEventsReturn, CreateEventData } from './types/businessEvents';

export const useBusinessEvents = (): UseBusinessEventsReturn => {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

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

  const createEvent = async (eventData: CreateEventData) => {
    try {
      setError(null);
      
      const newEvent = await createBusinessEvent(eventData);
      setEvents([...events, newEvent]);
      
      toast({
        title: "✅ Événement créé !",
        description: `"${eventData.title}" a été publié avec succès`,
      });
      
      return { data: newEvent, error: null };
    } catch (error) {
      const apiError = createApiError(error, 'createEvent');
      setError(apiError);
      toast({
        title: "Erreur",
        description: apiError.message,
        variant: "destructive"
      });
      return { data: null, error: apiError };
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      setError(null);
      
      await deleteBusinessEvent(eventId);
      setEvents(events.filter(event => event.id !== eventId));
      
      toast({
        title: "🗑️ Événement supprimé",
        description: "L'événement a été retiré de votre liste",
      });
      
      return { error: null };
    } catch (error) {
      const apiError = createApiError(error, 'deleteEvent');
      setError(apiError);
      toast({
        title: "Erreur",
        description: apiError.message,
        variant: "destructive"
      });
      return { error: apiError };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    deleteEvent,
    refetch: fetchEvents,
    clearError: () => setError(null)
  };
};
