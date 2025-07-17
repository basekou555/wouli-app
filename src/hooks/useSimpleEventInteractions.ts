import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { eventInteractions } from '@/services/eventInteractions';
import { supabase } from '@/integrations/supabase/client';

export const useSimpleEventInteractions = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Récupérer l'utilisateur actuel
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLike = async (eventId: string, eventTitle?: string) => {
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour liker un événement",
        variant: "destructive"
      });
      return false;
    }

    const success = await eventInteractions.likeEvent(eventId, userId);
    if (success) {
      toast({
        title: "❤️ Événement aimé !",
        description: eventTitle ? `Vous avez aimé "${eventTitle}"` : "Événement ajouté à vos favoris"
      });
    }
    return success;
  };

  const handleUnlike = async (eventId: string, eventTitle?: string) => {
    if (!userId) return false;

    const success = await eventInteractions.unlikeEvent(eventId, userId);
    if (success) {
      toast({
        title: "💔 Like retiré",
        description: eventTitle ? `Vous n'aimez plus "${eventTitle}"` : "Événement retiré de vos favoris"
      });
    }
    return success;
  };

  const handleParticipate = async (eventId: string, eventTitle?: string, status: 'going' | 'interested' = 'going') => {
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour participer à un événement",
        variant: "destructive"
      });
      return false;
    }

    const success = await eventInteractions.joinEvent(eventId, userId, status);
    if (success) {
      toast({
        title: "🎉 Participation confirmée !",
        description: eventTitle ? `Vous participez à "${eventTitle}"` : "Participation enregistrée"
      });
    }
    return success;
  };

  const handleCancelParticipation = async (eventId: string, eventTitle?: string) => {
    if (!userId) return false;

    const success = await eventInteractions.leaveEvent(eventId, userId);
    if (success) {
      toast({
        title: "❌ Participation annulée",
        description: eventTitle ? `Vous ne participez plus à "${eventTitle}"` : "Participation annulée"
      });
    }
    return success;
  };

  const handleIncrementViews = async (eventId: string) => {
    return await eventInteractions.incrementViews(eventId);
  };

  const getInteractionStatus = async (eventId: string) => {
    if (!userId) return { hasLiked: false, hasParticipated: false };
    return await eventInteractions.getInteractionStatus(eventId, userId);
  };

  return {
    userId,
    handleLike,
    handleUnlike,
    handleParticipate,
    handleCancelParticipation,
    handleIncrementViews,
    getInteractionStatus
  };
};