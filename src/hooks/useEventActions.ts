
import { useToast } from '@/hooks/use-toast';
import { incrementEventViews, likeEventInDatabase, participateInEventDatabase } from '@/services/eventInteractionService';
import { UnifiedEvent } from '@/types/unified';

export const useEventActions = (
  events: UnifiedEvent[],
  refetch: () => Promise<void>
) => {
  const { toast } = useToast();

  const incrementViews = async (eventId: string, source?: 'user' | 'business') => {
    console.log('🔄 Hook: Incrémentation des vues pour l\'événement:', eventId);
    
    const newViews = await incrementEventViews(eventId, source);
    
    if (newViews !== null) {
      console.log('✅ Hook: Vues incrémentées, rechargement des données');
      // Trigger a refetch to get updated data
      await refetch();
    } else {
      console.error('❌ Hook: Échec de l\'incrémentation des vues');
    }
  };

  const likeEvent = async (eventId: string, userId: string): Promise<boolean> => {
    console.log('🔄 Hook: Tentative de like pour l\'événement:', eventId, 'utilisateur:', userId);
    
    if (!userId) {
      console.error('❌ Hook: Utilisateur non connecté');
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour aimer un événement",
        variant: "destructive"
      });
      return false;
    }

    const success = await likeEventInDatabase(eventId, userId);
    
    if (success) {
      console.log('✅ Hook: Like réussi, affichage du toast et rechargement');
      toast({
        title: "❤️ Événement aimé !",
        description: "L'événement a été ajouté à tes favoris"
      });
      
      // Trigger a refetch to get updated data
      await refetch();
      return true;
    } else {
      console.log('⚠️ Hook: Like échoué ou déjà existant');
      toast({
        title: "Déjà aimé",
        description: "Tu as déjà aimé cet événement",
        variant: "destructive"
      });
      return false;
    }
  };

  const participateEvent = async (eventId: string, userId: string, status: 'going' | 'interested' = 'going'): Promise<boolean> => {
    console.log('🔄 Hook: Tentative de participation pour l\'événement:', eventId, 'utilisateur:', userId);
    
    if (!userId) {
      console.error('❌ Hook: Utilisateur non connecté');
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour participer à un événement",
        variant: "destructive"
      });
      return false;
    }

    const success = await participateInEventDatabase(eventId, userId, status);
    
    if (success) {
      console.log('✅ Hook: Participation réussie, affichage du toast et rechargement');
      toast({
        title: "🎉 Participation confirmée !",
        description: status === 'going' ? "Tu participes à cet événement" : "Tu es intéressé par cet événement"
      });
      
      // Trigger a refetch to get updated data
      await refetch();
      return true;
    } else {
      console.log('⚠️ Hook: Participation échouée ou déjà existante');
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
