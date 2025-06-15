
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { securityMiddleware } from '@/services/securityMiddleware';
import { useToast } from '@/hooks/use-toast';

export const useSecureEventActions = () => {
  const { user } = useAuth();
  const { likeEvent, participateEvent } = useEvents();
  const { monitorDatabaseErrors, monitorActivityPatterns } = useSecurityMonitoring();
  const { toast } = useToast();

  const secureLikeEvent = useCallback(async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour aimer un événement",
        variant: "destructive"
      });
      return;
    }

    try {
      // Vérifier les permissions
      const hasPermission = await securityMiddleware.checkPermissions(user.id, 'like_event', eventId);
      if (!hasPermission) {
        throw new Error('Permission refusée');
      }

      // Vérifier le rate limiting
      const withinLimit = securityMiddleware.checkRateLimit(user.id, 'like_event', 5, 60000); // 5 likes par minute max
      if (!withinLimit) {
        toast({
          title: "Trop de demandes",
          description: "Veuillez attendre avant d'aimer d'autres événements",
          variant: "destructive"
        });
        return;
      }

      // Surveiller l'activité
      monitorActivityPatterns(user.id, 'like_event');

      // Exécuter l'action
      await likeEvent(eventId, user.id);

    } catch (error) {
      monitorDatabaseErrors(error, 'like_event');
      console.error('Erreur lors du like sécurisé:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'aimer cet événement",
        variant: "destructive"
      });
    }
  }, [user, likeEvent, monitorDatabaseErrors, monitorActivityPatterns, toast]);

  const secureParticipateEvent = useCallback(async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour participer à un événement",
        variant: "destructive"
      });
      return;
    }

    try {
      // Vérifier les permissions
      const hasPermission = await securityMiddleware.checkPermissions(user.id, 'participate_event', eventId);
      if (!hasPermission) {
        throw new Error('Permission refusée');
      }

      // Vérifier le rate limiting
      const withinLimit = securityMiddleware.checkRateLimit(user.id, 'participate_event', 3, 60000); // 3 participations par minute max
      if (!withinLimit) {
        toast({
          title: "Trop de demandes",
          description: "Veuillez attendre avant de participer à d'autres événements",
          variant: "destructive"
        });
        return;
      }

      // Surveiller l'activité
      monitorActivityPatterns(user.id, 'participate_event');

      // Exécuter l'action
      await participateEvent(eventId, user.id);

    } catch (error) {
      monitorDatabaseErrors(error, 'participate_event');
      console.error('Erreur lors de la participation sécurisée:', error);
      toast({
        title: "Erreur",
        description: "Impossible de participer à cet événement",
        variant: "destructive"
      });
    }
  }, [user, participateEvent, monitorDatabaseErrors, monitorActivityPatterns, toast]);

  return {
    secureLikeEvent,
    secureParticipateEvent
  };
};
