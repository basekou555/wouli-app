
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BusinessEvent {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  event_type: string;
  price?: string;
  image_url?: string;
  views: number;
  likes: number;
  participants: number;
}

export const useBusinessEvents = () => {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
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
            venue: 'Blue Note Bar',
            category: 'bar',
            event_type: 'À boire',
            price: '15€',
            views: 120,
            likes: 25,
            participants: 45
          },
          {
            id: '2',
            title: 'Happy Hour',
            description: 'Cocktails à prix réduit',
            date: '2025-06-15',
            time: '18:00',
            venue: 'Blue Note Bar',
            category: 'bar',
            event_type: 'À boire',
            price: '8€',
            views: 89,
            likes: 18,
            participants: 32
          }
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('business_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive"
      });
      // Use mock data as fallback
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Add to mock data if not authenticated
        const newEvent: BusinessEvent = {
          id: (events.length + 1).toString(),
          ...eventData,
          views: 0,
          likes: 0,
          participants: 0
        };
        setEvents([...events, newEvent]);
        toast({
          title: "✅ Événement créé !",
          description: `"${eventData.title}" a été publié avec succès`,
        });
        return;
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

      if (error) {
        console.error('Error creating event:', error);
        throw error;
      }

      const newEvent = data;
      setEvents([...events, newEvent]);
      toast({
        title: "✅ Événement créé !",
        description: `"${eventData.title}" a été publié avec succès`,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive"
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Remove from mock data if not authenticated
        setEvents(events.filter(event => event.id !== eventId));
        toast({
          title: "🗑️ Événement supprimé",
          description: "L'événement a été retiré de votre liste",
        });
        return;
      }

      const { error } = await supabase
        .from('business_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        throw error;
      }

      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: "🗑️ Événement supprimé",
        description: "L'événement a été retiré de votre liste",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    deleteEvent,
    refetch: fetchEvents
  };
};
