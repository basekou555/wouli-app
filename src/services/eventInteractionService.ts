
import { supabase } from '@/integrations/supabase/client';

// Fonction pour détecter automatiquement la source d'un événement
const detectEventSource = async (eventId: string): Promise<'user' | 'business'> => {
  console.log('🔍 Détection de la source pour l\'événement:', eventId);

  // Vérifier d'abord dans la table events
  const { data: userEvent, error: userError } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle();

  if (userError) {
    console.warn('⚠️ Erreur lors de la vérification dans events:', userError);
  }

  if (userEvent) {
    console.log('✅ Événement trouvé dans la table events (source: user)');
    return 'user';
  }

  // Si pas trouvé dans events, vérifier dans business_events
  const { data: businessEvent, error: businessError } = await supabase
    .from('business_events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle();

  if (businessError) {
    console.warn('⚠️ Erreur lors de la vérification dans business_events:', businessError);
  }

  if (businessEvent) {
    console.log('✅ Événement trouvé dans la table business_events (source: business)');
    return 'business';
  }

  console.error('❌ Événement introuvable dans les deux tables');
  throw new Error(`Événement ${eventId} introuvable`);
};

export const incrementEventViews = async (eventId: string, source?: 'user' | 'business'): Promise<number | null> => {
  try {
    console.log('👁️ Incrémentation des vues pour l\'événement:', eventId);

    // Détecter automatiquement la source si pas fournie
    const eventSource = source || await detectEventSource(eventId);
    const tableName = eventSource === 'user' ? 'events' : 'business_events';
    
    console.log(`📊 Mise à jour des vues dans la table: ${tableName}`);

    // Récupérer le compteur actuel
    const { data: currentEvent, error: fetchError } = await supabase
      .from(tableName)
      .select('views')
      .eq('id', eventId)
      .single();
    
    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des vues actuelles:', fetchError);
      throw fetchError;
    }
    
    // Incrémenter les vues
    const newViews = (currentEvent?.views || 0) + 1;
    const { error } = await supabase
      .from(tableName)
      .update({ views: newViews })
      .eq('id', eventId);
    
    if (error) {
      console.error('❌ Erreur lors de la mise à jour des vues:', error);
      throw error;
    }

    console.log(`✅ Vues mises à jour: ${newViews}`);
    return newViews;
  } catch (error) {
    console.error('❌ Erreur générale lors de l\'incrémentation des vues:', error);
    return null;
  }
};

export const likeEventInDatabase = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    console.log('❤️ Tentative de like pour l\'événement:', eventId, 'par l\'utilisateur:', userId);

    // Vérifier l'authentification
    if (!userId) {
      console.error('❌ Utilisateur non authentifié');
      return false;
    }

    // Vérifier si déjà liké
    const { data: existingLike, error: checkError } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Erreur lors de la vérification du like existant:', checkError);
      return false;
    }

    if (existingLike) {
      console.log('⚠️ Événement déjà liké par cet utilisateur');
      return false;
    }

    // Détecter la source de l'événement
    const eventSource = await detectEventSource(eventId);
    console.log(`📊 Source détectée: ${eventSource}`);

    // Ajouter le like
    const { error: likeError } = await supabase
      .from('event_likes')
      .insert({ event_id: eventId, user_id: userId });

    if (likeError) {
      console.error('❌ Erreur lors de l\'insertion du like:', likeError);
      return false;
    }

    console.log('✅ Like ajouté avec succès');

    // Mettre à jour le compteur approprié
    const tableName = eventSource === 'user' ? 'events' : 'business_events';
    const { error: rpcError } = await supabase
      .rpc('increment_event_likes_counter', { 
        event_id: eventId, 
        table_name: tableName 
      });

    if (rpcError) {
      console.error(`❌ Erreur lors de la mise à jour du compteur ${tableName}:`, rpcError);
      // Ne pas faire échouer l'opération car le like a été enregistré
    } else {
      console.log(`✅ Compteur de likes mis à jour pour ${tableName}`);
    }

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
    console.log('🎉 Tentative de participation pour l\'événement:', eventId, 'par l\'utilisateur:', userId, 'statut:', status);

    // Vérifier l'authentification
    if (!userId) {
      console.error('❌ Utilisateur non authentifié');
      return false;
    }

    // Vérifier si déjà participant
    const { data: existingParticipation, error: checkError } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Erreur lors de la vérification de la participation existante:', checkError);
      return false;
    }

    if (existingParticipation) {
      console.log('⚠️ L\'utilisateur participe déjà à cet événement');
      return false;
    }

    // Détecter la source de l'événement
    const eventSource = await detectEventSource(eventId);
    console.log(`📊 Source détectée: ${eventSource}`);

    // Ajouter la participation
    const { error: participationError } = await supabase
      .from('event_participants')
      .insert({ event_id: eventId, user_id: userId, status });

    if (participationError) {
      console.error('❌ Erreur lors de l\'insertion de la participation:', participationError);
      return false;
    }

    console.log('✅ Participation ajoutée avec succès');

    // Mettre à jour le compteur approprié
    const tableName = eventSource === 'user' ? 'events' : 'business_events';
    const { error: rpcError } = await supabase
      .rpc('increment_event_participants_counter', { 
        event_id: eventId, 
        table_name: tableName 
      });

    if (rpcError) {
      console.error(`❌ Erreur lors de la mise à jour du compteur de participants ${tableName}:`, rpcError);
      // Ne pas faire échouer l'opération car la participation a été enregistrée
    } else {
      console.log(`✅ Compteur de participants mis à jour pour ${tableName}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur générale lors de la participation:', error);
    return false;
  }
};

export const getEventInteractionStatus = async (eventId: string, userId: string) => {
  try {
    console.log('🔍 Vérification du statut d\'interaction pour l\'événement:', eventId, 'utilisateur:', userId);

    if (!userId) {
      console.log('⚠️ Utilisateur non connecté, retour des statuts par défaut');
      return { hasLiked: false, hasParticipated: false };
    }

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

    if (likesResult.error) {
      console.error('❌ Erreur lors de la vérification des likes:', likesResult.error);
    }
    
    if (participantsResult.error) {
      console.error('❌ Erreur lors de la vérification des participants:', participantsResult.error);
    }

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
