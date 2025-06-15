
import { supabase } from '@/integrations/supabase/client';

export const fetchLikedEvents = async (userId: string) => {
  console.log('📋 Récupération des événements likés...');
  
  const [userEventLikes, businessEventLikes] = await Promise.all([
    // Likes sur événements users
    supabase
      .from('event_likes')
      .select(`
        event_id,
        events (*)
      `)
      .eq('user_id', userId),
    
    // Likes sur événements business
    supabase
      .from('event_likes')
      .select(`
        event_id,
        business_events (*)
      `)
      .eq('user_id', userId)
  ]);

  return { userEventLikes, businessEventLikes };
};

export const fetchParticipatingEvents = async (userId: string) => {
  console.log('📋 Récupération des événements de participation...');
  
  const [userEventParticipations, businessEventParticipations] = await Promise.all([
    // Participations sur événements users
    supabase
      .from('event_participants')
      .select(`
        event_id,
        events (*)
      `)
      .eq('user_id', userId),
    
    // Participations sur événements business
    supabase
      .from('event_participants')
      .select(`
        event_id,
        business_events (*)
      `)
      .eq('user_id', userId)
  ]);

  return { userEventParticipations, businessEventParticipations };
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
