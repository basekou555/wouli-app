
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEventActions = (refetch?: () => Promise<void>) => {
  const { toast } = useToast();

  const likeEvent = async (eventId: string, userId: string): Promise<boolean> => {
    console.log('❤️ Hook: Tentative de like pour l\'événement:', eventId, 'utilisateur:', userId);
    
    if (!userId) {
      console.error('❌ Hook: Utilisateur non connecté');
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour aimer un événement",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Vérifier si déjà liké
      const { data: existingLike, error: checkError } = await supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erreur lors de la vérification du like existant:', checkError);
        throw checkError;
      }

      if (existingLike) {
        console.log('⚠️ Événement déjà liké par cet utilisateur');
        toast({
          title: "Déjà aimé",
          description: "Tu as déjà aimé cet événement",
          variant: "destructive"
        });
        return false;
      }

      // Ajouter le like
      const { error: likeError } = await supabase
        .from('event_likes')
        .insert({ event_id: eventId, user_id: userId });

      if (likeError) {
        console.error('❌ Erreur lors de l\'insertion du like:', likeError);
        throw likeError;
      }

      console.log('✅ Hook: Like réussi');
      toast({
        title: "❤️ Événement aimé !",
        description: "L'événement a été ajouté à tes favoris"
      });
      
      // Trigger refetch if provided
      if (refetch) {
        await refetch();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Hook: Erreur générale lors du like:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'aimer cet événement",
        variant: "destructive"
      });
      return false;
    }
  };

  const participateEvent = async (eventId: string, userId: string, status: 'going' | 'interested' = 'going'): Promise<boolean> => {
    console.log('🎉 Hook: Tentative de participation pour l\'événement:', eventId, 'utilisateur:', userId);
    
    if (!userId) {
      console.error('❌ Hook: Utilisateur non connecté');
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour participer à un événement",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Vérifier si déjà participant
      const { data: existingParticipation, error: checkError } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erreur lors de la vérification de la participation existante:', checkError);
        throw checkError;
      }

      if (existingParticipation) {
        console.log('⚠️ L\'utilisateur participe déjà à cet événement');
        toast({
          title: "Déjà inscrit",
          description: "Tu participes déjà à cet événement",
          variant: "destructive"
        });
        return false;
      }

      // Ajouter la participation
      const { error: participationError } = await supabase
        .from('event_participants')
        .insert({ event_id: eventId, user_id: userId, status });

      if (participationError) {
        console.error('❌ Erreur lors de l\'insertion de la participation:', participationError);
        throw participationError;
      }

      console.log('✅ Hook: Participation réussie');
      toast({
        title: "🎉 Participation confirmée !",
        description: status === 'going' ? "Tu participes à cet événement" : "Tu es intéressé par cet événement"
      });
      
      // Trigger refetch if provided
      if (refetch) {
        await refetch();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Hook: Erreur générale lors de la participation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de participer à cet événement",
        variant: "destructive"
      });
      return false;
    }
  };

  const incrementViews = async (eventId: string): Promise<boolean> => {
    console.log('👁️ Hook: Incrémentation des vues pour l\'événement:', eventId);
    
    try {
      // Récupérer le compteur actuel
      const { data: currentEvent, error: fetchError } = await supabase
        .from('events')
        .select('views')
        .eq('id', eventId)
        .single();
      
      if (fetchError) {
        console.error('❌ Erreur lors de la récupération des vues actuelles:', fetchError);
        throw fetchError;
      }
      
      // Incrémenter les vues
      const newViews = (currentEvent?.views || 0) + 1;
      const { error } = await supabase
        .from('events')
        .update({ views: newViews })
        .eq('id', eventId);
      
      if (error) {
        console.error('❌ Erreur lors de la mise à jour des vues:', error);
        throw error;
      }

      console.log(`✅ Vues mises à jour: ${newViews}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur générale lors de l\'incrémentation des vues:', error);
      return false;
    }
  };

  return {
    likeEvent,
    participateEvent,
    incrementViews
  };
};
