
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';
import { useSimpleEventInteractions } from '@/hooks/useSimpleEventInteractions';
import { useAuth } from '@/contexts/AuthContext';

export const useEventPreview = (eventId: string | undefined) => {
  const [event, setEvent] = useState<UnifiedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Utiliser les nouvelles actions simplifiées
  const { handleLike: simpleLike, handleParticipate: simpleParticipate, handleIncrementViews } = useSimpleEventInteractions();

  const fetchEvent = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      console.log('🔍 Récupération de l\'événement:', eventId);
      
      // Try to find in business_events first
      const { data: businessEvent, error: businessError } = await supabase
        .from('business_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (businessEvent) {
        console.log('✅ Événement business trouvé:', businessEvent);
        
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
        
        // Incrémenter les vues automatiquement
        await handleIncrementViews(eventId);
        return;
      }

      // If not found in business_events, try events table
      const { data: userEvent, error: userError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (userEvent) {
        console.log('✅ Événement utilisateur trouvé:', userEvent);
        
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
        
        // Incrémenter les vues automatiquement
        await handleIncrementViews(eventId);
        return;
      }

      console.log('❌ Événement non trouvé dans aucune table');
      setError('Événement non trouvé');
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'événement:', error);
      setError('Erreur lors du chargement de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  // Vraie fonction de participation qui utilise la base de données
  const handleParticipate = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour participer à un événement",
        variant: "destructive"
      });
      return;
    }

    if (!eventId) {
      toast({
        title: "Erreur",
        description: "ID d'événement manquant",
        variant: "destructive"
      });
      return;
    }

    console.log('🎉 Tentative de participation à l\'événement:', eventId);
    const success = await simpleParticipate(eventId, event?.title);
    
    if (success) {
      console.log('✅ Participation réussie');
      await fetchEvent(); // Refetch pour mettre à jour les compteurs
    }
  };

  // Vraie fonction de like qui utilise la base de données
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour aimer un événement",
        variant: "destructive"
      });
      return;
    }

    if (!eventId) {
      toast({
        title: "Erreur",
        description: "ID d'événement manquant",
        variant: "destructive"
      });
      return;
    }

    console.log('❤️ Tentative de like de l\'événement:', eventId);
    const success = await simpleLike(eventId, event?.title);
    
    if (success) {
      console.log('✅ Like réussi');
      await fetchEvent(); // Refetch pour mettre à jour les compteurs
    }
  };

  return {
    event,
    loading,
    error,
    handleParticipate,
    handleLike
  };
};
