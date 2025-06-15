import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEventActions = (refetch?: () => Promise<void>) => {
  const { toast } = useToast();

  const likeEvent = async (eventId: string, userId: string): Promise<boolean> => {
    console.log('❤️ DEBUT likeEvent - Événement:', eventId, 'Utilisateur:', userId);
    
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
      console.log('🔍 Vérification de la session...');
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
      console.log('✅ Session active confirmée pour:', session.user.email);

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
          description: `Impossible de vérifier le statut du like: ${checkError.message}`,
          variant: "destructive"
        });
        return false;
      }

      if (existingLike) {
        console.log('⚠️ Événement déjà liké par cet utilisateur');
        toast({
          title: "Déjà aimé",
          description: "Tu as déjà aimé cet événement",
        });
        return false;
      }
      console.log('✅ Aucun like existant trouvé, procédure d\'ajout...');

      // Ajouter le like
      console.log('➕ Insertion du like dans event_likes...');
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
        } else if (likeError.message.includes('duplicate key')) {
          toast({
            title: "Déjà aimé",
            description: "Tu as déjà aimé cet événement",
          });
        } else {
          toast({
            title: "Erreur",
            description: `Impossible d'aimer cet événement: ${likeError.message}`,
            variant: "destructive"
          });
        }
        return false;
      }

      console.log('✅ Like ajouté avec succès dans event_likes');
      
      // Mettre à jour le compteur dans la table appropriée
      console.log('🔄 Mise à jour du compteur de likes...');
      
      // D'abord, déterminer dans quelle table se trouve l'événement
      const { data: businessEvent } = await supabase
        .from('business_events')
        .select('id')
        .eq('id', eventId)
        .maybeSingle();

      const tableName = businessEvent ? 'business_events' : 'events';
      console.log('📊 Table cible pour le compteur:', tableName);

      // Utiliser la fonction RPC pour incrémenter le compteur
      const { error: rpcError } = await supabase
        .rpc('increment_event_likes_counter', { 
          event_id: eventId, 
          table_name: tableName 
        });

      if (rpcError) {
        console.error('⚠️ Erreur lors de la mise à jour du compteur (non bloquant):', rpcError);
      } else {
        console.log('✅ Compteur de likes mis à jour avec succès');
      }

      toast({
        title: "❤️ Événement aimé !",
        description: "L'événement a été ajouté à tes favoris"
      });
      
      // Trigger refetch if provided
      if (refetch) {
        console.log('🔄 Rafraîchissement des données...');
        await refetch();
      }
      
      console.log('✅ FIN likeEvent - Succès total');
      return true;
    } catch (error) {
      console.error('❌ Erreur générale lors du like:', error);
      toast({
        title: "Erreur",
        description: `Une erreur inattendue s'est produite: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const participateEvent = async (eventId: string, userId: string, status: 'going' | 'interested' = 'going'): Promise<boolean> => {
    console.log('🎉 DEBUT participateEvent - Événement:', eventId, 'Utilisateur:', userId, 'Status:', status);
    
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
      console.log('🔍 Vérification de la session...');
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
      console.log('✅ Session active confirmée pour:', session.user.email);

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
          description: `Impossible de vérifier le statut de participation: ${checkError.message}`,
          variant: "destructive"
        });
        return false;
      }

      if (existingParticipation) {
        console.log('⚠️ L\'utilisateur participe déjà à cet événement');
        toast({
          title: "Déjà inscrit",
          description: "Tu participes déjà à cet événement",
        });
        return false;
      }
      console.log('✅ Aucune participation existante trouvée, procédure d\'ajout...');

      // Ajouter la participation
      console.log('➕ Insertion de la participation dans event_participants...');
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
        } else if (participationError.message.includes('duplicate key')) {
          toast({
            title: "Déjà inscrit",
            description: "Tu participes déjà à cet événement",
          });
        } else {
          toast({
            title: "Erreur",
            description: `Impossible de participer à cet événement: ${participationError.message}`,
            variant: "destructive"
          });
        }
        return false;
      }

      console.log('✅ Participation ajoutée avec succès dans event_participants');
      
      // Mettre à jour le compteur dans la table appropriée
      console.log('🔄 Mise à jour du compteur de participants...');
      
      // Déterminer dans quelle table se trouve l'événement
      const { data: businessEvent } = await supabase
        .from('business_events')
        .select('id')
        .eq('id', eventId)
        .maybeSingle();

      const tableName = businessEvent ? 'business_events' : 'events';
      console.log('📊 Table cible pour le compteur:', tableName);

      // Utiliser la fonction RPC pour incrémenter le compteur
      const { error: rpcError } = await supabase
        .rpc('increment_event_participants_counter', { 
          event_id: eventId, 
          table_name: tableName 
        });

      if (rpcError) {
        console.error('⚠️ Erreur lors de la mise à jour du compteur (non bloquant):', rpcError);
      } else {
        console.log('✅ Compteur de participants mis à jour avec succès');
      }

      toast({
        title: "🎉 Participation confirmée !",
        description: status === 'going' ? "Tu participes à cet événement" : "Tu es intéressé par cet événement"
      });
      
      // Trigger refetch if provided
      if (refetch) {
        console.log('🔄 Rafraîchissement des données...');
        await refetch();
      }
      
      console.log('✅ FIN participateEvent - Succès total');
      return true;
    } catch (error) {
      console.error('❌ Erreur générale lors de la participation:', error);
      toast({
        title: "Erreur",
        description: `Une erreur inattendue s'est produite: ${error.message}`,
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
