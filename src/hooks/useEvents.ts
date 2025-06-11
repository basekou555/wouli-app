
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Event = Tables<'events'>;

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const incrementViews = async (eventId: string) => {
    try {
      // Update views directly since the RPC function expects a different type
      const { error } = await supabase
        .from('events')
        .update({ views: supabase.raw('views + 1') })
        .eq('id', eventId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const likeEvent = async (eventId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('event_likes')
        .insert({ event_id: eventId, user_id: userId });

      if (error) throw error;
      
      toast({
        title: "❤️ Événement aimé !",
        description: "L'événement a été ajouté à tes favoris"
      });
    } catch (error) {
      console.error('Error liking event:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'aimer cet événement",
        variant: "destructive"
      });
    }
  };

  const participateEvent = async (eventId: string, userId: string, status: 'going' | 'interested' = 'going') => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: userId, status });

      if (error) throw error;
      
      toast({
        title: "🎉 Participation confirmée !",
        description: status === 'going' ? "Tu participes à cet événement" : "Tu es intéressé par cet événement"
      });
    } catch (error) {
      console.error('Error participating in event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de participer à cet événement",
        variant: "destructive"
      });
    }
  };

  return {
    events,
    loading,
    refetch: fetchEvents,
    incrementViews,
    likeEvent,
    participateEvent
  };
};
