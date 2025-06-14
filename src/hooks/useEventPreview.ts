
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';

export const useEventPreview = (eventId: string | undefined) => {
  const [event, setEvent] = useState<UnifiedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        
        // Try to find in business_events first
        const { data: businessEvent, error: businessError } = await supabase
          .from('business_events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (businessEvent) {
          // Get business config for organizer name
          const { data: businessConfig } = await supabase
            .from('business_configs')
            .select('client_name')
            .eq('user_id', businessEvent.user_id)
            .single();

          const mappedEvent: UnifiedEvent = {
            id: businessEvent.id,
            title: businessEvent.title,
            description: businessEvent.description,
            date: `${businessEvent.date}T${businessEvent.time}`,
            location: businessEvent.venue,
            category: businessEvent.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
            image_url: businessEvent.image_url,
            views: businessEvent.views || 0,
            likes: businessEvent.likes || 0,
            participants: businessEvent.participants || 0,
            created_at: businessEvent.created_at,
            updated_at: businessEvent.updated_at,
            source: 'business',
            organizer: businessConfig?.client_name || 'Établissement',
            organizer_type: 'business',
            venue: businessEvent.venue,
            time: businessEvent.time,
            event_type: businessEvent.event_type as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
            price_text: businessEvent.price
          };
          
          setEvent(mappedEvent);
          return;
        }

        // If not found in business_events, try events table
        const { data: userEvent, error: userError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (userEvent) {
          const mappedEvent: UnifiedEvent = {
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
          
          setEvent(mappedEvent);
          return;
        }

        setError('Événement non trouvé');
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Erreur lors du chargement de l\'événement');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleParticipate = () => {
    toast({
      title: "Intéressé par cet événement ?",
      description: "Téléchargez l'app Wouli pour participer !",
    });
  };

  return {
    event,
    loading,
    error,
    handleParticipate
  };
};
