
import { supabase } from '@/integrations/supabase/client';

export const incrementEventViews = async (eventId: string, source: 'user' | 'business'): Promise<number | null> => {
  try {
    const tableName = source === 'user' ? 'events' : 'business_events';
    
    // First get the current views count
    const { data: currentEvent, error: fetchError } = await supabase
      .from(tableName)
      .select('views')
      .eq('id', eventId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Then update with incremented value
    const newViews = (currentEvent?.views || 0) + 1;
    const { error } = await supabase
      .from(tableName)
      .update({ views: newViews })
      .eq('id', eventId);
    
    if (error) throw error;

    return newViews;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return null;
  }
};

export const likeEventInDatabase = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    console.log('🔄 Tentative de like pour l\'événement:', eventId, 'par l\'utilisateur:', userId);

    // Check if already liked to prevent duplicates
    const { data: existingLike, error: checkError } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Erreur lors de la vérification du like existant:', checkError);
      throw checkError;
    }

    if (existingLike) {
      console.log('⚠️ Événement déjà liké par cet utilisateur');
      return false;
    }

    // Add the like
    const { error: likeError } = await supabase
      .from('event_likes')
      .insert({ event_id: eventId, user_id: userId });

    if (likeError) {
      console.error('❌ Erreur lors de l\'insertion du like:', likeError);
      throw likeError;
    }

    console.log('✅ Like ajouté avec succès');

    // Use RPC functions to update counters
    const { error: eventsRpcError } = await supabase
      .rpc('increment_event_likes_counter', { 
        event_id: eventId, 
        table_name: 'events' 
      });

    const { error: businessEventsRpcError } = await supabase
      .rpc('increment_event_likes_counter', { 
        event_id: eventId, 
        table_name: 'business_events' 
      });

    if (eventsRpcError) console.warn('⚠️ Erreur lors de la mise à jour du compteur events:', eventsRpcError);
    if (businessEventsRpcError) console.warn('⚠️ Erreur lors de la mise à jour du compteur business_events:', businessEventsRpcError);

    console.log('✅ Compteurs mis à jour');
    return true;
  } catch (error) {
    console.error('❌ Erreur générale lors du like:', error);
    return false;
  }
};

export const participateInEventDatabase = async (
  eventId: string, 
  userId: string, 
  status: 'going' | 'interested' = 'going'
): Promise<boolean> => {
  try {
    console.log('🔄 Tentative de participation pour l\'événement:', eventId, 'par l\'utilisateur:', userId, 'statut:', status);

    // Check if already participating to prevent duplicates
    const { data: existingParticipation, error: checkError } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Erreur lors de la vérification de la participation existante:', checkError);
      throw checkError;
    }

    if (existingParticipation) {
      console.log('⚠️ L\'utilisateur participe déjà à cet événement');
      return false;
    }

    // Add the participation
    const { error: participationError } = await supabase
      .from('event_participants')
      .insert({ event_id: eventId, user_id: userId, status });

    if (participationError) {
      console.error('❌ Erreur lors de l\'insertion de la participation:', participationError);
      throw participationError;
    }

    console.log('✅ Participation ajoutée avec succès');

    // Use RPC functions to update counters
    const { error: eventsRpcError } = await supabase
      .rpc('increment_event_participants_counter', { 
        event_id: eventId, 
        table_name: 'events' 
      });

    const { error: businessEventsRpcError } = await supabase
      .rpc('increment_event_participants_counter', { 
        event_id: eventId, 
        table_name: 'business_events' 
      });

    if (eventsRpcError) console.warn('⚠️ Erreur lors de la mise à jour du compteur de participants events:', eventsRpcError);
    if (businessEventsRpcError) console.warn('⚠️ Erreur lors de la mise à jour du compteur de participants business_events:', businessEventsRpcError);

    console.log('✅ Compteurs de participants mis à jour');
    return true;
  } catch (error) {
    console.error('❌ Erreur générale lors de la participation:', error);
    return false;
  }
};

export const getEventInteractionStatus = async (eventId: string, userId: string) => {
  try {
    console.log('🔍 Vérification du statut d\'interaction pour l\'événement:', eventId, 'utilisateur:', userId);

    const [likesResult, participantsResult] = await Promise.all([
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

    const status = {
      hasLiked: !!likesResult.data,
      hasParticipated: !!participantsResult.data
    };

    console.log('📊 Statut d\'interaction:', status);
    return status;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du statut d\'interaction:', error);
    return {
      hasLiked: false,
      hasParticipated: false
    };
  }
};
