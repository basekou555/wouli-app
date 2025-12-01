
import { supabase } from '@/integrations/supabase/client';

export const fetchLikedEvents = async (userId: string) => {
  console.log('📋 Récupération des événements likés...');
  
  // 1. Récupérer les event_ids likés
  const { data: likeIds, error: likesError } = await supabase
    .from('event_likes')
    .select('event_id')
    .eq('user_id', userId);

  if (likesError) {
    console.error('❌ Erreur récupération likes:', likesError);
    return { events: [], businessEvents: [], error: likesError };
  }

  const eventIds = likeIds?.map(l => l.event_id) || [];
  
  if (eventIds.length === 0) {
    return { events: [], businessEvents: [], error: null };
  }

  // 2. Récupérer les événements correspondants (sans jointure)
  const [eventsResult, businessEventsResult] = await Promise.all([
    supabase.from('events').select('*').in('id', eventIds),
    supabase.from('business_events').select('*').in('id', eventIds)
  ]);

  return {
    events: eventsResult.data || [],
    businessEvents: businessEventsResult.data || [],
    error: eventsResult.error || businessEventsResult.error
  };
};

export const fetchParticipatingEvents = async (userId: string) => {
  console.log('📋 Récupération des événements de participation...');
  
  // 1. Récupérer les event_ids de participation
  const { data: participationIds, error: participationsError } = await supabase
    .from('event_participants')
    .select('event_id')
    .eq('user_id', userId);

  if (participationsError) {
    console.error('❌ Erreur récupération participations:', participationsError);
    return { events: [], businessEvents: [], error: participationsError };
  }

  const eventIds = participationIds?.map(p => p.event_id) || [];
  
  if (eventIds.length === 0) {
    return { events: [], businessEvents: [], error: null };
  }

  // 2. Récupérer les événements correspondants (sans jointure)
  const [eventsResult, businessEventsResult] = await Promise.all([
    supabase.from('events').select('*').in('id', eventIds),
    supabase.from('business_events').select('*').in('id', eventIds)
  ]);

  return {
    events: eventsResult.data || [],
    businessEvents: businessEventsResult.data || [],
    error: eventsResult.error || businessEventsResult.error
  };
};

export const removeLike = async (eventId: string, userId: string) => {
  const { error } = await supabase
    .from('event_likes')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const removeParticipation = async (eventId: string, userId: string) => {
  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId);

  if (error) throw error;
};
