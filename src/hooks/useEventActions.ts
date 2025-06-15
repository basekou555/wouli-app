
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEventActions = (refetch?: () => Promise<void>) => {
  const { toast } = useToast();

  const likeEvent = async (eventId: string, userId: string): Promise<boolean> => {
    console.log('❤️ Tentative de like - Événement:', eventId, 'Utilisateur:', userId);
    
    if (!userId) {
      console.error('❌ Utilisateur non connecté pour le like');
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour aimer un événement",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Vérifier l'état d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ Aucune session active');
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        return false;
      }

      // Vérifier si déjà liké
      console.log('🔍 Vérification du like existant...');
      const { data: existingLike, error: checkError } = await supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erreur lors de la vérification du like:', checkError);
        toast({
          title: "Erreur de vérification",
          description: "Impossible de vérifier le statut du like",
          variant: "destructive"
        });
        return false;
      }

      if (existingLike) {
        console.log('⚠️ Événement déjà liké');
        toast({
          title: "Déjà aimé",
          description: "Tu as déjà aimé cet événement",
          variant: "destructive"
        });
        return false;
      }

      // Ajouter le like
      console.log('➕ Ajout du like...');
      const { error: likeError } = await supabase
        .from('event_likes')
        .insert({ 
          event_id: eventId, 
          user_id: userId 
        });

      if (likeError) {
        console.error('❌ Erreur lors de l\'insertion du like:', likeError);
        
        // Messages d'erreur plus spécifiques
        if (likeError.message.includes('row-level security')) {
          toast({
            title: "Erreur de permissions",
            description: "Problème d'autorisation. Veuillez vous reconnecter.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible d'aimer cet événement",
            variant: "destructive"
          });
        }
        return false;
      }

      console.log('✅ Like ajouté avec succès');
      toast({
        title: "❤️ Événement aimé !",
        description: "L'événement a été ajouté à tes favoris"
      });
      
      // Trigger refetch if provided
      if (refetch) {
        console.log('🔄 Rafraîchissement des données...');
        await refetch();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur générale lors du like:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
      return false;
    }
  };

  const participateEvent = async (eventId: string, userId: string, status: 'going' | 'interested' = 'going'): Promise<boolean> => {
    console.log('🎉 Tentative de participation - Événement:', eventId, 'Utilisateur:', userId);
    
    if (!userId) {
      console.error('❌ Utilisateur non connecté pour la participation');
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour participer à un événement",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Vérifier l'état d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ Aucune session active');
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        return false;
      }

      // Vérifier si déjà participant
      console.log('🔍 Vérification de la participation existante...');
      const { data: existingParticipation, error: checkError } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Erreur lors de la vérification de la participation:', checkError);
        toast({
          title: "Erreur de vérification",
          description: "Impossible de vérifier le statut de participation",
          variant: "destructive"
        });
        return false;
      }

      if (existingParticipation) {
        console.log('⚠️ L\'utilisateur participe déjà');
        toast({
          title: "Déjà inscrit",
          description: "Tu participes déjà à cet événement",
          variant: "destructive"
        });
        return false;
      }

      // Ajouter la participation
      console.log('➕ Ajout de la participation...');
      const { error: participationError } = await supabase
        .from('event_participants')
        .insert({ 
          event_id: eventId, 
          user_id: userId, 
          status 
        });

      if (participationError) {
        console.error('❌ Erreur lors de l\'insertion de la participation:', participationError);
        
        // Messages d'erreur plus spécifiques
        if (participationError.message.includes('row-level security')) {
          toast({
            title: "Erreur de permissions",
            description: "Problème d'autorisation. Veuillez vous reconnecter.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erreur",
            description: "Impossible de participer à cet événement",
            variant: "destructive"
          });
        }
        return false;
      }

      console.log('✅ Participation ajoutée avec succès');
      toast({
        title: "🎉 Participation confirmée !",
        description: status === 'going' ? "Tu participes à cet événement" : "Tu es intéressé par cet événement"
      });
      
      // Trigger refetch if provided
      if (refetch) {
        console.log('🔄 Rafraîchissement des données...');
        await refetch();
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur générale lors de la participation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
      return false;
    }
  };

  const incrementViews = async (eventId: string): Promise<boolean> => {
    console.log('👁️ Incrémentation des vues pour l\'événement:', eventId);
    
    try {
      // Récupérer le compteur actuel
      const { data: currentEvent, error: fetchError } = await supabase
        .from('events')
        .select('views')
        .eq('id', eventId)
        .single();
      
      if (fetchError) {
        console.error('❌ Erreur lors de la récupération des vues actuelles:', fetchError);
        return false;
      }
      
      // Incrémenter les vues
      const newViews = (currentEvent?.views || 0) + 1;
      const { error } = await supabase
        .from('events')
        .update({ views: newViews })
        .eq('id', eventId);
      
      if (error) {
        console.error('❌ Erreur lors de la mise à jour des vues:', error);
        return false;
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
