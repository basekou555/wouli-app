
import { BusinessEvent } from '@/types/events';
import { ApiError } from '@/types/api';
import { createApiError } from '../utils/errorHandling';
import { createBusinessEvent, updateBusinessEvent, deleteBusinessEvent } from '@/services/businessEventsService';
import { CreateEventData, UpdateEventData } from '../types/businessEvents';

export const useBusinessEventActions = (
  events: BusinessEvent[],
  setEvents: React.Dispatch<React.SetStateAction<BusinessEvent[]>>,
  setError: React.Dispatch<React.SetStateAction<ApiError | null>>,
  toast: any
) => {
  const createEventAction = async (eventData: CreateEventData) => {
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

  const updateEventAction = async (eventId: string, eventData: UpdateEventData) => {
    try {
      setError(null);
      
      const updatedEvent = await updateBusinessEvent(eventId, eventData);
      setEvents(events.map(event => event.id === eventId ? updatedEvent : event));
      
      toast({
        title: "✅ Événement modifié !",
        description: `"${updatedEvent.title}" a été mis à jour avec succès`,
      });
      
      return { data: updatedEvent, error: null };
    } catch (error) {
      const apiError = createApiError(error, 'updateEvent');
      setError(apiError);
      toast({
        title: "Erreur",
        description: apiError.message,
        variant: "destructive"
      });
      return { data: null, error: apiError };
    }
  };

  const deleteEventAction = async (eventId: string) => {
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

  return {
    createEventAction,
    updateEventAction,
    deleteEventAction
  };
};
