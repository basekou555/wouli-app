
import { supabase } from '@/integrations/supabase/client';
import { securityMiddleware } from './securityMiddleware';
import { secureLog } from '@/utils/security';

// Fonction pour détecter automatiquement la source d'un événement
const detectEventSource = async (eventId: string): Promise<'user' | 'business'> => {
  secureLog('Détection de la source pour l\'événement', { eventId });

  // Validation de sécurité de l'ID
  if (!eventId || typeof eventId !== 'string' || eventId.length > 100) {
    throw new Error('ID d\'événement invalide');
  }

  // Vérifier d'abord dans la table events
  const { data: userEvent, error: userError } = await supabase
    .from('events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle();

  if (userError) {
    secureLog('Erreur lors de la vérification dans events', { error: userError.message });
  }

  if (userEvent) {
    secureLog('Événement trouvé dans la table events (source: user)');
    return 'user';
  }

  // Si pas trouvé dans events, vérifier dans business_events
  const { data: businessEvent, error: businessError } = await supabase
    .from('business_events')
    .select('id')
    .eq('id', eventId)
    .maybeSingle();

  if (businessError) {
    secureLog('Erreur lors de la vérification dans business_events', { error: businessError.message });
  }

  if (businessEvent) {
    secureLog('Événement trouvé dans la table business_events (source: business)');
    return 'business';
  }

  secureLog('Événement introuvable dans les deux tables', { eventId });
  throw new Error(`Événement ${eventId} introuvable`);
};

export const incrementEventViews = async (eventId: string, source?: 'user' | 'business'): Promise<number | null> => {
  try {
    secureLog('Incrémentation des vues pour l\'événement', { eventId });

    // Validation de sécurité
    if (!eventId || typeof eventId !== 'string') {
      throw new Error('ID d\'événement invalide');
    }

    // Détecter automatiquement la source si pas fournie
    const eventSource = source || await detectEventSource(eventId);
    const tableName = eventSource === 'user' ? 'events' : 'business_events';
    
    secureLog('Mise à jour des vues dans la table', { tableName });

    // Récupérer le compteur actuel avec validation
    const { data: currentEvent, error: fetchError } = await supabase
      .from(tableName)
      .select('views')
      .eq('id', eventId)
      .single();
    
    if (fetchError) {
      secureLog('Erreur lors de la récupération des vues actuelles', { error: fetchError.message });
      throw fetchError;
    }
    
    // Validation du compteur actuel
    const currentViews = currentEvent?.views || 0;
    if (currentViews < 0 || currentViews > 1000000) {
      secureLog('Compteur de vues suspect détecté', { currentViews, eventId });
    }
    
    // Incrémenter les vues
    const newViews = Math.max(0, currentViews + 1);
    const { error } = await supabase
      .from(tableName)
      .update({ views: newViews })
      .eq('id', eventId);
    
    if (error) {
      secureLog('Erreur lors de la mise à jour des vues', { error: error.message });
      throw error;
    }

    secureLog('Vues mises à jour avec succès', { newViews });
    return newViews;
  } catch (error) {
    secureLog('Erreur générale lors de l\'incrémentation des vues', { error: error.message });
    return null;
  }
};

export const likeEventInDatabase = async (eventId: string, userId: string): Promise<boolean> => {
  try {
    secureLog('Tentative de like pour l\'événement', { eventId, userId });

    // Validation de sécurité stricte
    if (!userId || typeof userId !== 'string') {
      secureLog('Utilisateur non authentifié ou ID invalide');
      return false;
    }

    if (!eventId || typeof eventId !== 'string') {
      secureLog('ID d\'événement invalide');
      return false;
    }

    // Vérification du rate limiting
    if (!securityMiddleware.checkRateLimit(userId, 'like_event', 5, 60000)) {
      secureLog('Rate limit dépassé pour les likes', { userId });
      return false;
    }

    // Vérifier si déjà liké avec validation
    const { data: existingLike, error: checkError } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      secureLog('Erreur lors de la vérification du like existant', { error: checkError.message });
      return false;
    }

    if (existingLike) {
      secureLog('Événement déjà liké par cet utilisateur');
      return false;
    }

    // Détecter la source de l'événement
    const eventSource = await detectEventSource(eventId);
    secureLog('Source détectée pour le like', { eventSource });

    // Ajouter le like
    const { error: likeError } = await supabase
      .from('event_likes')
      .insert({ event_id: eventId, user_id: userId });

    if (likeError) {
      secureLog('Erreur lors de l\'insertion du like', { error: likeError.message });
      return false;
    }

    secureLog('Like ajouté avec succès');

    // Mettre à jour le compteur approprié
    const tableName = eventSource === 'user' ? 'events' : 'business_events';
    const { error: rpcError } = await supabase
      .rpc('increment_event_likes_counter', { 
        event_id: eventId, 
        table_name: tableName 
      });

    if (rpcError) {
      secureLog('Erreur lors de la mise à jour du compteur de likes', { error: rpcError.message, tableName });
      // Ne pas faire échouer l'opération car le like a été enregistré
    } else {
      secureLog('Compteur de likes mis à jour avec succès', { tableName });
    }

    return true;
  } catch (error) {
    secureLog('Erreur générale lors du like', { error: error.message });
    return false;
  }
};

export const participateInEventDatabase = async (
  eventId: string, 
  userId: string, 
  status: 'going' | 'interested' = 'going'
): Promise<boolean> => {
  try {
    secureLog('Tentative de participation pour l\'événement', { eventId, userId, status });

    // Validation de sécurité stricte
    if (!userId || typeof userId !== 'string') {
      secureLog('Utilisateur non authentifié ou ID invalide');
      return false;
    }

    if (!eventId || typeof eventId !== 'string') {
      secureLog('ID d\'événement invalide');
      return false;
    }

    // Validation du statut
    if (!['going', 'interested'].includes(status)) {
      secureLog('Statut de participation invalide', { status });
      return false;
    }

    // Vérification du rate limiting
    if (!securityMiddleware.checkRateLimit(userId, 'participate_event', 3, 60000)) {
      secureLog('Rate limit dépassé pour les participations', { userId });
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
      secureLog('Erreur lors de la vérification de la participation existante', { error: checkError.message });
      return false;
    }

    if (existingParticipation) {
      secureLog('L\'utilisateur participe déjà à cet événement');
      return false;
    }

    // Détecter la source de l'événement
    const eventSource = await detectEventSource(eventId);
    secureLog('Source détectée pour la participation', { eventSource });

    // Ajouter la participation
    const { error: participationError } = await supabase
      .from('event_participants')
      .insert({ event_id: eventId, user_id: userId, status });

    if (participationError) {
      secureLog('Erreur lors de l\'insertion de la participation', { error: participationError.message });
      return false;
    }

    secureLog('Participation ajoutée avec succès');

    // Mettre à jour le compteur approprié
    const tableName = eventSource === 'user' ? 'events' : 'business_events';
    const { error: rpcError } = await supabase
      .rpc('increment_event_participants_counter', { 
        event_id: eventId, 
        table_name: tableName 
      });

    if (rpcError) {
      secureLog('Erreur lors de la mise à jour du compteur de participants', { error: rpcError.message, tableName });
      // Ne pas faire échouer l'opération car la participation a été enregistrée
    } else {
      secureLog('Compteur de participants mis à jour avec succès', { tableName });
    }

    return true;
  } catch (error) {
    secureLog('Erreur générale lors de la participation', { error: error.message });
    return false;
  }
};

export const getEventInteractionStatus = async (eventId: string, userId: string) => {
  try {
    secureLog('Vérification du statut d\'interaction pour l\'événement', { eventId, userId });

    // Validation de sécurité
    if (!eventId || typeof eventId !== 'string') {
      secureLog('ID d\'événement invalide pour le statut d\'interaction');
      return { hasLiked: false, hasParticipated: false };
    }

    if (!userId) {
      secureLog('Utilisateur non connecté, retour des statuts par défaut');
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
      secureLog('Erreur lors de la vérification des likes', { error: likesResult.error.message });
    }
    
    if (participantsResult.error) {
      secureLog('Erreur lors de la vérification des participants', { error: participantsResult.error.message });
    }

    const status = {
      hasLiked: !!likesResult.data,
      hasParticipated: !!participantsResult.data
    };

    secureLog('Statut d\'interaction récupéré', status);
    return status;
  } catch (error) {
    secureLog('Erreur lors de la récupération du statut d\'interaction', { error: error.message });
    return {
      hasLiked: false,
      hasParticipated: false
    };
  }
};
