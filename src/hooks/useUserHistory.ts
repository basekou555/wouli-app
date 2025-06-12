
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type Event = Tables<'events'>;

interface UserHistoryData {
  likedEvents: Event[];
  participatingEvents: Event[];
  loading: boolean;
}

export const useUserHistory = () => {
  const [data, setData] = useState<UserHistoryData>({
    likedEvents: [],
    participatingEvents: [],
    loading: true
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserHistory = async () => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Récupérer les événements likés
      const { data: likedEventsData, error: likesError } = await supabase
        .from('event_likes')
        .select(`
          event_id,
          events (*)
        `)
        .eq('user_id', user.id);

      if (likesError) throw likesError;

      // Récupérer les événements auxquels l'utilisateur participe
      const { data: participatingEventsData, error: participantsError } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          events (*)
        `)
        .eq('user_id', user.id);

      if (participantsError) throw participantsError;

      const likedEvents = likedEventsData?.map(item => item.events).filter(Boolean) as Event[] || [];
      const participatingEvents = participatingEventsData?.map(item => item.events).filter(Boolean) as Event[] || [];

      setData({
        likedEvents,
        participatingEvents,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching user history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre historique",
        variant: "destructive"
      });
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const removeLikedEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      setData(prev => ({
        ...prev,
        likedEvents: prev.likedEvents.filter(event => event.id !== eventId)
      }));

      toast({
        title: "Retiré des favoris",
        description: "L'événement a été retiré de vos favoris",
      });
    } catch (error) {
      console.error('Error removing liked event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer l'événement des favoris",
        variant: "destructive"
      });
    }
  };

  const removeParticipation = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      setData(prev => ({
        ...prev,
        participatingEvents: prev.participatingEvents.filter(event => event.id !== eventId)
      }));

      toast({
        title: "Participation annulée",
        description: "Votre participation a été annulée",
      });
    } catch (error) {
      console.error('Error removing participation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la participation",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUserHistory();
  }, [user]);

  return {
    ...data,
    removeLikedEvent,
    removeParticipation,
    refetch: fetchUserHistory
  };
};
