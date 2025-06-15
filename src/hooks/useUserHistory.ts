
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
  const { user, session } = useAuth();
  const { toast } = useToast();

  const fetchUserHistory = async () => {
    if (!user || !session) {
      console.log('👤 Aucun utilisateur connecté ou session expirée pour l\'historique');
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      console.log('🔄 Récupération de l\'historique pour l\'utilisateur:', user.id);

      // Vérifier l'état de la session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.error('❌ Session expirée lors de la récupération de l\'historique');
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour voir votre historique",
          variant: "destructive"
        });
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Récupérer les événements likés
      console.log('📋 Récupération des événements likés...');
      const { data: likesData, error: likesError } = await supabase
        .from('event_likes')
        .select(`
          event_id,
          events (*)
        `)
        .eq('user_id', user.id);

      if (likesError) {
        console.error('❌ Erreur lors de la récupération des likes:', likesError);
        if (likesError.message.includes('row-level security')) {
          toast({
            title: "Erreur d'autorisation",
            description: "Problème d'accès aux données. Reconnectez-vous.",
            variant: "destructive"
          });
        }
        throw likesError;
      }

      // Récupérer les événements auxquels l'utilisateur participe
      console.log('📋 Récupération des événements de participation...');
      const { data: participantsData, error: participantsError } = await supabase
        .from('event_participants')
        .select(`
          event_id,
          events (*)
        `)
        .eq('user_id', user.id);

      if (participantsError) {
        console.error('❌ Erreur lors de la récupération des participations:', participantsError);
        if (participantsError.message.includes('row-level security')) {
          toast({
            title: "Erreur d'autorisation",
            description: "Problème d'accès aux données. Reconnectez-vous.",
            variant: "destructive"
          });
        }
        throw participantsError;
      }

      // Extraire les événements valides
      const likedEvents = likesData
        ?.map(item => item.events)
        .filter(Boolean) as Event[] || [];
      
      const participatingEvents = participantsData
        ?.map(item => item.events)
        .filter(Boolean) as Event[] || [];

      console.log('📊 Historique récupéré - Likés:', likedEvents.length, 'Participants:', participatingEvents.length);

      setData({
        likedEvents,
        participatingEvents,
        loading: false
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique utilisateur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre historique",
        variant: "destructive"
      });
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const removeLikedEvent = async (eventId: string) => {
    if (!user || !session) {
      console.error('❌ Utilisateur non connecté pour la suppression du like');
      return;
    }

    try {
      console.log('🗑️ Suppression du like pour l\'événement:', eventId);

      // Vérifier l'état de la session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.error('❌ Session expirée lors de la suppression du like');
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erreur lors de la suppression du like:', error);
        if (error.message.includes('row-level security')) {
          toast({
            title: "Erreur d'autorisation",
            description: "Problème d'autorisation. Reconnectez-vous.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de retirer l'événement des favoris",
            variant: "destructive"
          });
        }
        return;
      }

      setData(prev => ({
        ...prev,
        likedEvents: prev.likedEvents.filter(event => event.id !== eventId)
      }));

      toast({
        title: "Retiré des favoris",
        description: "L'événement a été retiré de vos favoris",
      });

      console.log('✅ Like supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du like:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const removeParticipation = async (eventId: string) => {
    if (!user || !session) {
      console.error('❌ Utilisateur non connecté pour la suppression de la participation');
      return;
    }

    try {
      console.log('🗑️ Suppression de la participation pour l\'événement:', eventId);

      // Vérifier l'état de la session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.error('❌ Session expirée lors de la suppression de la participation');
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erreur lors de la suppression de la participation:', error);
        if (error.message.includes('row-level security')) {
          toast({
            title: "Erreur d'autorisation",
            description: "Problème d'autorisation. Reconnectez-vous.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible d'annuler la participation",
            variant: "destructive"
          });
        }
        return;
      }

      setData(prev => ({
        ...prev,
        participatingEvents: prev.participatingEvents.filter(event => event.id !== eventId)
      }));

      toast({
        title: "Participation annulée",
        description: "Votre participation a été annulée",
      });

      console.log('✅ Participation supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la participation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchUserHistory();
  }, [user, session]);

  return {
    ...data,
    removeLikedEvent,
    removeParticipation,
    refetch: fetchUserHistory
  };
};
