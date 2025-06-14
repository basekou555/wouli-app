
import { useToast } from '@/hooks/use-toast';
import { incrementEventViews, likeEventInDatabase, participateInEventDatabase } from '@/services/eventInteractionService';
import { UnifiedEvent } from '@/types/unified';

export const useEventActions = (
  events: UnifiedEvent[],
  setEvents: React.Dispatch<React.SetStateAction<UnifiedEvent[]>>
) => {
  const { toast } = useToast();

  const incrementViews = async (eventId: string, source: 'user' | 'business') => {
    const newViews = await incrementEventViews(eventId, source);
    
    if (newViews !== null) {
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, views: newViews }
          : event
      ));
    }
  };

  const likeEvent = async (eventId: string, userId: string): Promise<boolean> => {
    const success = await likeEventInDatabase(eventId, userId);
    
    if (success) {
      // Update local state optimistically
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, likes: (event.likes || 0) + 1 }
          : event
      ));
      
      toast({
        title: "❤️ Événement aimé !",
        description: "L'événement a été ajouté à tes favoris"
      });
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
    const success = await participateInEventDatabase(eventId, userId, status);
    
    if (success) {
      // Update local state optimistically
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, participants: (event.participants || 0) + 1 }
          : event
      ));
      
      toast({
        title: "🎉 Participation confirmée !",
        description: status === 'going' ? "Tu participes à cet événement" : "Tu es intéressé par cet événement"
      });
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
