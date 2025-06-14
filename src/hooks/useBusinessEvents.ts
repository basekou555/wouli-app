
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BusinessEvent } from '@/types/events';
import { ApiError } from '@/types/api';

export const useBusinessEvents = () => {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Use mock data if not authenticated
        setEvents([
          {
            id: '1',
            title: 'Soirée Jazz',
            description: 'Une soirée jazz intimiste',
            date: '2025-06-14',
            time: '20:00',
            location: 'Blue Note Bar',
            venue: 'Blue Note Bar',
            category: 'bar',
            event_type: 'À boire',
            price: '15€',
            views: 120,
            likes: 25,
            participants: 45,
            user_id: 'mock'
          },
          {
            id: '2',
            title: 'Happy Hour',
            description: 'Cocktails à prix réduit',
            date: '2025-06-15',
            time: '18:00',
            location: 'Blue Note Bar',
            venue: 'Blue Note Bar',
            category: 'bar',
            event_type: 'À boire',
            price: '8€',
            views: 89,
            likes: 18,
            participants: 32,
            user_id: 'mock'
          }
        ]);
        return;
      }

      const { data, error } = await supabase
        .from('business_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      handleError(error, 'fetchEvents');
      // Fallback to empty array instead of showing error immediately
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>) => {
    try {
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const newEvent: BusinessEvent = {
          id: (events.length + 1).toString(),
          ...eventData,
          views: 0,
          likes: 0,
          participants: 0,
          user_id: 'mock'
        };
        setEvents([...events, newEvent]);
        toast({
          title: "✅ Événement créé !",
          description: `"${eventData.title}" a été publié avec succès`,
        });
        return { data: newEvent, error: null };
      }

      const { data, error } = await supabase
        .from('business_events')
        .insert({
          user_id: user.id,
          ...eventData,
          views: 0,
          likes: 0,
          participants: 0
        })
        .select()
        .single();

      if (error) throw error;

      setEvents([...events, data]);
      toast({
        title: "✅ Événement créé !",
        description: `"${eventData.title}" a été publié avec succès`,
      });
      
      return { data, error: null };
    } catch (error) {
      const apiError = handleError(error, 'createEvent');
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEvents(events.filter(event => event.id !== eventId));
        toast({
          title: "🗑️ Événement supprimé",
          description: "L'événement a été retiré de votre liste",
        });
        return { error: null };
      }

      const { error } = await supabase
        .from('business_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: "🗑️ Événement supprimé",
        description: "L'événement a été retiré de votre liste",
      });
      
      return { error: null };
    } catch (error) {
      const apiError = handleError(error, 'deleteEvent');
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
