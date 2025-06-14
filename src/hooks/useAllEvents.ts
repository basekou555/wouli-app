
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UnifiedEvent, EventSource } from '@/types/unified';
import { ApiError } from '@/types/api';

export const useAllEvents = (source: EventSource = 'all') => {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { toast } = useToast();

  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    const apiError: ApiError = {
      message: error.message || 'Une erreur inattendue s\'est produite',
      code: error.code,
      details: error
    };
    setError(apiError);
    return apiError;
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allEvents: UnifiedEvent[] = [];

      // Fetch user events if needed
      if (source === 'all' || source === 'user') {
        const { data: userEvents, error: userError } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (userError) {
          console.warn('Error fetching user events:', userError);
        } else if (userEvents) {
          const mappedUserEvents: UnifiedEvent[] = userEvents.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            location: event.location,
            category: event.category,
            image_url: event.image_url,
            views: event.views || 0,
            likes: event.likes || 0,
            participants: event.participants || 0,
            created_at: event.created_at,
            updated_at: event.updated_at,
            source: 'user',
            organizer: 'Utilisateur', // Could be enhanced with profile lookup
            organizer_type: 'user',
            end_date: event.end_date,
            price_text: event.price ? `${event.price}€` : undefined,
            max_participants: event.max_participants,
            address: event.address,
            tags: event.tags,
            external_url: event.external_url
          }));
          allEvents.push(...mappedUserEvents);
        }
      }

      // Fetch business events if needed
      if (source === 'all' || source === 'business') {
        // First get business events
        const { data: businessEvents, error: businessError } = await supabase
          .from('business_events')
          .select('*')
          .order('date', { ascending: true });

        if (businessError) {
          console.warn('Error fetching business events:', businessError);
        } else if (businessEvents) {
          // Then get business configs for organizer names
          const userIds = [...new Set(businessEvents.map(event => event.user_id))];
          const { data: businessConfigs, error: configError } = await supabase
            .from('business_configs')
            .select('user_id, client_name')
            .in('user_id', userIds);

          if (configError) {
            console.warn('Error fetching business configs:', configError);
          }

          // Create a map for quick lookup
          const configMap = new Map(
            businessConfigs?.map(config => [config.user_id, config.client_name]) || []
          );

          const mappedBusinessEvents: UnifiedEvent[] = businessEvents.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: `${event.date}T${event.time}`,
            location: event.venue,
            category: event.category,
            image_url: event.image_url,
            views: event.views || 0,
            likes: event.likes || 0,
            participants: event.participants || 0,
            created_at: event.created_at,
            updated_at: event.updated_at,
            source: 'business',
            organizer: configMap.get(event.user_id) || 'Établissement',
            organizer_type: 'business',
            venue: event.venue,
            time: event.time,
            event_type: event.event_type,
            price_text: event.price
          }));
          allEvents.push(...mappedBusinessEvents);
        }
      }

      // Sort all events by date
      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setEvents(allEvents);
    } catch (error) {
      handleError(error, 'fetchEvents');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (eventId: string, source: 'user' | 'business') => {
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

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, views: newViews }
          : event
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const likeEvent = async (eventId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('event_likes')
        .insert({ event_id: eventId, user_id: userId });

      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, likes: (event.likes || 0) + 1 }
          : event
      ));
      
      toast({
        title: "❤️ Événement aimé !",
        description: "L'événement a été ajouté à tes favoris"
      });
    } catch (error) {
      console.error('Error liking event:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'aimer cet événement",
        variant: "destructive"
      });
    }
  };

  const participateEvent = async (eventId: string, userId: string, status: 'going' | 'interested' = 'going') => {
    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: userId, status });

      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, participants: (event.participants || 0) + 1 }
          : event
      ));
      
      toast({
        title: "🎉 Participation confirmée !",
        description: status === 'going' ? "Tu participes à cet événement" : "Tu es intéressé par cet événement"
      });
    } catch (error) {
      console.error('Error participating in event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de participer à cet événement",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [source]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    incrementViews,
    likeEvent,
    participateEvent,
    clearError: () => setError(null)
  };
};
