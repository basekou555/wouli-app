
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { UnifiedEvent } from '@/types/unified';

export const useEventInteractions = (allEvents: UnifiedEvent[]) => {
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const { toast } = useToast();

  const handleLike = (eventId: string) => {
    if (!likedEvents.includes(eventId)) {
      setLikedEvents([...likedEvents, eventId]);
      const event = allEvents.find(e => e.id === eventId);
      toast({
        title: "❤️ Événement aimé !",
        description: `Tu as aimé "${event?.title}"`,
      });
    }
  };

  const handleParticipate = (eventId: string) => {
    if (!participatingEvents.includes(eventId)) {
      setParticipatingEvents([...participatingEvents, eventId]);
      const event = allEvents.find(e => e.id === eventId);
      toast({
        title: "🎉 Participation confirmée !",
        description: `Tu participes à "${event?.title}"`,
      });
    }
  };

  return {
    likedEvents,
    participatingEvents,
    handleLike,
    handleParticipate
  };
};
