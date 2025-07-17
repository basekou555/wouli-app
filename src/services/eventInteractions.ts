import { supabase } from '@/integrations/supabase/client';

export interface EventInteractionStatus {
  hasLiked: boolean;
  hasParticipated: boolean;
}

export const eventInteractions = {
  // Liker un événement
  async likeEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_likes')
        .insert({ event_id: eventId, user_id: userId });

      if (error) {
        if (error.code === '23505') { // duplicate key error
          console.log('Événement déjà liké');
          return false;
        }
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Erreur lors du like:', error);
      return false;
    }
  },

  // Unliker un événement
  async unlikeEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors du unlike:', error);
      return false;
    }
  },

  // Participer à un événement
  async joinEvent(eventId: string, userId: string, status: 'going' | 'interested' = 'going'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: userId, status });

      if (error) {
        if (error.code === '23505') { // duplicate key error
          console.log('Participation déjà enregistrée');
          return false;
        }
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la participation:', error);
      return false;
    }
  },

  // Annuler la participation
  async leaveEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      return false;
    }
  },

  // Incrémenter les vues
  async incrementViews(eventId: string): Promise<boolean> {
    try {
      // Vérifier d'abord dans events
      const { data: eventData } = await supabase
        .from('events')
        .select('views')
        .eq('id', eventId)
        .single();

      if (eventData) {
        const { error } = await supabase
          .from('events')
          .update({ views: (eventData.views || 0) + 1 })
          .eq('id', eventId);
        
        if (error) throw error;
        return true;
      }

      // Sinon essayer dans business_events
      const { data: businessEventData } = await supabase
        .from('business_events')
        .select('views')
        .eq('id', eventId)
        .single();

      if (businessEventData) {
        const { error } = await supabase
          .from('business_events')
          .update({ views: (businessEventData.views || 0) + 1 })
          .eq('id', eventId);
        
        if (error) throw error;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
      return false;
    }
  },

  // Récupérer le statut d'interaction d'un utilisateur
  async getInteractionStatus(eventId: string, userId: string): Promise<EventInteractionStatus> {
    try {
      const [likesResponse, participantsResponse] = await Promise.all([
        supabase
          .from('event_likes')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .single(),
        supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .single()
      ]);

      return {
        hasLiked: !likesResponse.error,
        hasParticipated: !participantsResponse.error
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      return { hasLiked: false, hasParticipated: false };
    }
  }
};