
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { removeLike, removeParticipation } from './services/userHistoryService';

export const useUserHistoryActions = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const removeLikedEvent = async (eventId: string, onSuccess: () => void) => {
    if (!user || !session) {
      console.error('❌ Utilisateur non connecté pour la suppression du like');
      return;
    }

    try {
      console.log('🗑️ Suppression du like pour l\'événement:', eventId);

      // Vérifier l'état de la session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.error('❌ Session expirée lors de la suppression du like');
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        return;
      }

      await removeLike(eventId, user.id);
      onSuccess();

      toast({
        title: "Retiré des favoris",
        description: "L'événement a été retiré de vos favoris",
      });

      console.log('✅ Like supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du like:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const removeParticipatingEvent = async (eventId: string, onSuccess: () => void) => {
    if (!user || !session) {
      console.error('❌ Utilisateur non connecté pour la suppression de la participation');
      return;
    }

    try {
      console.log('🗑️ Suppression de la participation pour l\'événement:', eventId);

      // Vérifier l'état de la session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        console.error('❌ Session expirée lors de la suppression de la participation');
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        return;
      }

      await removeParticipation(eventId, user.id);
      onSuccess();

      toast({
        title: "Participation annulée",
        description: "Votre participation a été annulée",
      });

      console.log('✅ Participation supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la participation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  return {
    removeLikedEvent,
    removeParticipatingEvent
  };
};
