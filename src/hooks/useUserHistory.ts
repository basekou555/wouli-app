import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { mapBusinessEventToUnified, mapUserEventToUnified } from './utils/eventMappers';
import { fetchLikedEvents, fetchParticipatingEvents } from './services/userHistoryService';


interface UserHistoryData {
  likedEvents: UnifiedEvent[];
  participatingEvents: UnifiedEvent[];
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

      // Récupérer les données
      const [likesResult, participationsResult] = await Promise.all([
        fetchLikedEvents(user.id),
        fetchParticipatingEvents(user.id)
      ]);

      // Vérifier les erreurs
      if (likesResult.userEventLikes.error) {
        console.error('❌ Erreur lors de la récupération des likes users:', likesResult.userEventLikes.error);
        throw likesResult.userEventLikes.error;
      }

      if (likesResult.businessEventLikes.error) {
        console.error('❌ Erreur lors de la récupération des likes business:', likesResult.businessEventLikes.error);
        throw likesResult.businessEventLikes.error;
      }

      if (participationsResult.userEventParticipations.error) {
        console.error('❌ Erreur lors de la récupération des participations users:', participationsResult.userEventParticipations.error);
        throw participationsResult.userEventParticipations.error;
      }

      if (participationsResult.businessEventParticipations.error) {
        console.error('❌ Erreur lors de la récupération des participations business:', participationsResult.businessEventParticipations.error);
        throw participationsResult.businessEventParticipations.error;
      }

      // Construire la liste des événements likés
      const likedEvents: UnifiedEvent[] = [];
      
      // Ajouter les événements users likés
      likesResult.userEventLikes.data
        ?.filter(item => item.events)
        .forEach(item => {
          if (item.events) {
            likedEvents.push(mapUserEventToUnified(item.events));
          }
        });
      
      // Ajouter les événements business likés
      likesResult.businessEventLikes.data
        ?.filter(item => item.business_events)
        .forEach(item => {
          if (item.business_events) {
            likedEvents.push(mapBusinessEventToUnified(item.business_events));
          }
        });

      // Construire la liste des événements de participation
      const participatingEvents: UnifiedEvent[] = [];
      
      // Ajouter les événements users de participation
      participationsResult.userEventParticipations.data
        ?.filter(item => item.events)
        .forEach(item => {
          if (item.events) {
            participatingEvents.push(mapUserEventToUnified(item.events));
          }
        });
      
      // Ajouter les événements business de participation
      participationsResult.businessEventParticipations.data
        ?.filter(item => item.business_events)
        .forEach(item => {
          if (item.business_events) {
            participatingEvents.push(mapBusinessEventToUnified(item.business_events));
          }
        });

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
    // Actions simplifiées - suppression locale seulement pour le moment
    setData(prev => ({
      ...prev,
      likedEvents: prev.likedEvents.filter(event => event.id !== eventId)
    }));
  };

  const removeParticipation = async (eventId: string) => {
    // Actions simplifiées - suppression locale seulement pour le moment
    setData(prev => ({
      ...prev,
      participatingEvents: prev.participatingEvents.filter(event => event.id !== eventId)
    }));
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
