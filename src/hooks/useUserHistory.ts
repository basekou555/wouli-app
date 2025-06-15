
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

  const mapBusinessEventToUnified = (businessEvent: any): UnifiedEvent => {
    return {
      id: businessEvent.id,
      title: businessEvent.title,
      description: businessEvent.description,
      date: `${businessEvent.date}T${businessEvent.time}`,
      location: businessEvent.venue || businessEvent.custom_venue || 'Lieu non spécifié',
      category: businessEvent.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
      image_url: businessEvent.image_url,
      views: businessEvent.views || 0,
      likes: businessEvent.likes || 0,
      participants: businessEvent.participants || 0,
      created_at: businessEvent.created_at,
      updated_at: businessEvent.updated_at,
      source: 'business',
      organizer: 'Établissement',
      organizer_type: 'business',
      venue: businessEvent.venue,
      time: businessEvent.time,
      event_type: businessEvent.event_type as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
      price_text: businessEvent.price,
      external_url: businessEvent.external_url
    };
  };

  const mapUserEventToUnified = (userEvent: any): UnifiedEvent => {
    return {
      id: userEvent.id,
      title: userEvent.title,
      description: userEvent.description,
      date: userEvent.date,
      location: userEvent.location,
      category: userEvent.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
      image_url: userEvent.image_url,
      views: userEvent.views || 0,
      likes: userEvent.likes || 0,
      participants: userEvent.participants || 0,
      created_at: userEvent.created_at,
      updated_at: userEvent.updated_at,
      source: 'user',
      organizer: 'Utilisateur',
      organizer_type: 'user',
      end_date: userEvent.end_date,
      price_text: userEvent.price ? `${userEvent.price}€` : undefined,
      max_participants: userEvent.max_participants,
      address: userEvent.address,
      tags: userEvent.tags,
      external_url: userEvent.external_url
    };
  };

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

      // Récupérer les événements likés depuis les deux tables
      console.log('📋 Récupération des événements likés...');
      const [userEventLikes, businessEventLikes] = await Promise.all([
        // Likes sur événements users
        supabase
          .from('event_likes')
          .select(`
            event_id,
            events (*)
          `)
          .eq('user_id', user.id),
        
        // Likes sur événements business
        supabase
          .from('event_likes')
          .select(`
            event_id,
            business_events (*)
          `)
          .eq('user_id', user.id)
      ]);

      if (userEventLikes.error) {
        console.error('❌ Erreur lors de la récupération des likes users:', userEventLikes.error);
        if (userEventLikes.error.message.includes('row-level security')) {
          toast({
            title: "Erreur d'autorisation",
            description: "Problème d'accès aux données. Reconnectez-vous.",
            variant: "destructive"
          });
        }
        throw userEventLikes.error;
      }

      if (businessEventLikes.error) {
        console.error('❌ Erreur lors de la récupération des likes business:', businessEventLikes.error);
        if (businessEventLikes.error.message.includes('row-level security')) {
          toast({
            title: "Erreur d'autorisation",
            description: "Problème d'accès aux données. Reconnectez-vous.",
            variant: "destructive"
          });
        }
        throw businessEventLikes.error;
      }

      // Récupérer les événements de participation depuis les deux tables
      console.log('📋 Récupération des événements de participation...');
      const [userEventParticipations, businessEventParticipations] = await Promise.all([
        // Participations sur événements users
        supabase
          .from('event_participants')
          .select(`
            event_id,
            events (*)
          `)
          .eq('user_id', user.id),
        
        // Participations sur événements business
        supabase
          .from('event_participants')
          .select(`
            event_id,
            business_events (*)
          `)
          .eq('user_id', user.id)
      ]);

      if (userEventParticipations.error) {
        console.error('❌ Erreur lors de la récupération des participations users:', userEventParticipations.error);
        if (userEventParticipations.error.message.includes('row-level security')) {
          toast({
            title: "Erreur d'autorisation",
            description: "Problème d'accès aux données. Reconnectez-vous.",
            variant: "destructive"
          });
        }
        throw userEventParticipations.error;
      }

      if (businessEventParticipations.error) {
        console.error('❌ Erreur lors de la récupération des participations business:', businessEventParticipations.error);
        if (businessEventParticipations.error.message.includes('row-level security')) {
          toast({
            title: "Erreur d'autorisation",
            description: "Problème d'accès aux données. Reconnectez-vous.",
            variant: "destructive"
          });
        }
        throw businessEventParticipations.error;
      }

      // Construire la liste des événements likés
      const likedEvents: UnifiedEvent[] = [];
      
      // Ajouter les événements users likés
      userEventLikes.data
        ?.filter(item => item.events)
        .forEach(item => {
          if (item.events) {
            likedEvents.push(mapUserEventToUnified(item.events));
          }
        });
      
      // Ajouter les événements business likés
      businessEventLikes.data
        ?.filter(item => item.business_events)
        .forEach(item => {
          if (item.business_events) {
            likedEvents.push(mapBusinessEventToUnified(item.business_events));
          }
        });

      // Construire la liste des événements de participation
      const participatingEvents: UnifiedEvent[] = [];
      
      // Ajouter les événements users de participation
      userEventParticipations.data
        ?.filter(item => item.events)
        .forEach(item => {
          if (item.events) {
            participatingEvents.push(mapUserEventToUnified(item.events));
          }
        });
      
      // Ajouter les événements business de participation
      businessEventParticipations.data
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
