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

  // Incrémenter les vues via RPC
  async incrementViews(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment_event_views', { 
        p_event_id: eventId 
      });
      
      if (error) {
        console.error('Erreur RPC increment_event_views:', error);
        return false;
      }
      return true;
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
          .maybeSingle(),
        supabase
          .from('event_participants')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .maybeSingle()
      ]);

      return {
        hasLiked: !!likesResponse.data,
        hasParticipated: !!participantsResponse.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      return { hasLiked: false, hasParticipated: false };
    }
  },

  // Tracker une vue d'événement
  async trackEventView(eventId: string, userId: string, source: string = 'app'): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('user_event_views')
        .insert({ 
          event_id: eventId, 
          user_id: userId, 
          source,
          view_date: today
        });

      if (error) {
        // Ignore duplicate key error (already viewed today)
        if (error.code === '23505') {
          return true;
        }
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Erreur lors du tracking de vue:', error);
      return false;
    }
  }
};