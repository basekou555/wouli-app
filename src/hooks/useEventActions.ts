
import { useToast } from '@/hooks/use-toast';
import { incrementEventViews, likeEventInDatabase, participateInEventDatabase } from '@/services/eventInteractionService';
import { UnifiedEvent } from '@/types/unified';

export const useEventActions = (
  events: UnifiedEvent[],
  refetch: () => Promise<void>
) => {
  const { toast } = useToast();

  const incrementViews = async (eventId: string, source: 'user' | 'business') => {
    const newViews = await incrementEventViews(eventId, source);
    
    if (newViews !== null) {
      // Trigger a refetch to get updated data
      await refetch();
    }
  };

  const likeEvent = async (eventId: string, userId: string): Promise<boolean> => {
    console.log('🔄 Hook: Tentative de like pour l\'événement:', eventId);
    
    if (!userId) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour aimer un événement",
        variant: "destructive"
      });
      return false;
    }

    const success = await likeEventInDatabase(eventId, userId);
    
    if (success) {
      toast({
        title: "❤️ Événement aimé !",
        description: "L'événement a été ajouté à tes favoris"
      });
      
      // Trigger a refetch to get updated data
      await refetch();
      return true;
    } else {
      toast({
        title: "Déjà aimé",
        description: "Tu as déjà aimé cet événement",
        variant: "destructive"
      });
      return false;
    }
  };

  const participateEvent = async (eventId: string, userId: string, status: 'going' | 'interested' = 'going'): Promise<boolean> => {
    console.log('🔄 Hook: Tentative de participation pour l\'événement:', eventId);
    
    if (!userId) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour participer à un événement",
        variant: "destructive"
      });
      return false;
    }

    const success = await participateInEventDatabase(eventId, userId, status);
    
    if (success) {
      toast({
        title: "🎉 Participation confirmée !",
        description: status === 'going' ? "Tu participes à cet événement" : "Tu es intéressé par cet événement"
      });
      
      // Trigger a refetch to get updated data
      await refetch();
      return true;
    } else {
      toast({
        title: "Déjà inscrit",
        description: "Tu participes déjà à cet événement",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    incrementViews,
    likeEvent,
    participateEvent
  };
};
