
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { UnifiedEvent } from '@/types/unified';
import { useSimpleEventInteractions } from './useSimpleEventInteractions';

export const useEventInteractions = (allEvents: UnifiedEvent[]) => {
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const { toast } = useToast();
  const { handleLike: simpleLike, handleParticipate: simpleParticipate, userId, getInteractionStatus } = useSimpleEventInteractions();

  // Charger le statut des interactions pour tous les événements
  useEffect(() => {
    if (userId && allEvents.length > 0) {
      const loadInteractionStatus = async () => {
        const liked: string[] = [];
        const participating: string[] = [];

        for (const event of allEvents) {
          const status = await getInteractionStatus(event.id);
          if (status.hasLiked) liked.push(event.id);
          if (status.hasParticipated) participating.push(event.id);
        }

        setLikedEvents(liked);
        setParticipatingEvents(participating);
      };

      loadInteractionStatus();
    }
  }, [userId, allEvents, getInteractionStatus]);

  const handleLike = async (eventId: string) => {
    if (!likedEvents.includes(eventId)) {
      const event = allEvents.find(e => e.id === eventId);
      const success = await simpleLike(eventId, event?.title);
      if (success) {
        setLikedEvents([...likedEvents, eventId]);
      }
    }
  };

  const handleParticipate = async (eventId: string) => {
    if (!participatingEvents.includes(eventId)) {
      const event = allEvents.find(e => e.id === eventId);
      const success = await simpleParticipate(eventId, event?.title);
      if (success) {
        setParticipatingEvents([...participatingEvents, eventId]);
      }
    }
  };

  return {
    likedEvents,
    participatingEvents,
    handleLike,
    handleParticipate
  };
};
