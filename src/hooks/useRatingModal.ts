import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockRatingService } from '@/services/mockRatingService';
import { UnifiedEvent } from '@/types/unified';
import { useToast } from '@/hooks/use-toast';

export interface RatingModalState {
  isOpen: boolean;
  event: UnifiedEvent | null;
  isBlocking: boolean;
}

export const useRatingModal = () => {
  const [modalState, setModalState] = useState<RatingModalState>({
    isOpen: false,
    event: null,
    isBlocking: false
  });
  const [eventsNeedingRating, setEventsNeedingRating] = useState<UnifiedEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check for events needing rating on app mount
  useEffect(() => {
    if (!user?.id) return;

    const checkForRatings = async () => {
      const events = await mockRatingService.getEventsNeedingRating(user.id);
      
      if (events.length > 0) {
        setEventsNeedingRating(events);
        setModalState({
          isOpen: true,
          event: events[0],
          isBlocking: true
        });
      }
    };

    // Check immediately
    checkForRatings();

    // Set up interval to check every 5 minutes
    const interval = setInterval(checkForRatings, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Handle timeout - after 24h, stop blocking
  useEffect(() => {
    if (!modalState.event || !modalState.isBlocking) return;

    const checkTimeout = () => {
      if (!modalState.event) return;
      
      const now = new Date();
      const eventDate = new Date(modalState.event.date);
      const durationHours = 4; // Default fallback
      const endTime = new Date(eventDate.getTime() + durationHours * 60 * 60 * 1000);
      const hoursSinceEnd = (now.getTime() - endTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceEnd > 24) {
        // Timeout reached, stop blocking
        setModalState(prev => ({ ...prev, isBlocking: false }));
        
        toast({
          title: "Délai dépassé",
          description: "Le délai pour noter cet événement est dépassé",
          variant: "destructive"
        });
      }
    };

    const timeoutInterval = setInterval(checkTimeout, 60 * 1000); // Check every minute
    
    return () => clearInterval(timeoutInterval);
  }, [modalState.event, modalState.isBlocking, toast]);

  const submitRating = async (
    rating: number, 
    comment?: string, 
    attended: boolean = true
  ): Promise<boolean> => {
    if (!modalState.event || !user?.id) return false;

    const success = await mockRatingService.submitRating(
      modalState.event.id,
      user.id,
      rating,
      comment,
      attended
    );

    if (success) {
      const successMessage = attended 
        ? "Merci ! Votre avis aide les autres à trouver les meilleurs plans 🎉"
        : "Merci pour votre retour !";
        
      toast({
        title: "Notation enregistrée",
        description: successMessage
      });

      // Move to next event or close modal
      const nextIndex = currentIndex + 1;
      if (nextIndex < eventsNeedingRating.length) {
        setCurrentIndex(nextIndex);
        setModalState({
          isOpen: true,
          event: eventsNeedingRating[nextIndex],
          isBlocking: true
        });
      } else {
        // All events rated
        setModalState({
          isOpen: false,
          event: null,
          isBlocking: false
        });
        setEventsNeedingRating([]);
        setCurrentIndex(0);
      }
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre notation",
        variant: "destructive"
      });
    }

    return success;
  };

  const skipRating = () => {
    if (!modalState.isBlocking) {
      // If not blocking, just close
      setModalState({
        isOpen: false,
        event: null,
        isBlocking: false
      });
      return;
    }

    toast({
      title: "Notation requise",
      description: "Veuillez noter cet événement pour continuer",
      variant: "destructive"
    });
  };

  const canSkip = !modalState.isBlocking;
  const hasMoreEvents = currentIndex < eventsNeedingRating.length - 1;
  const progress = eventsNeedingRating.length > 0 
    ? { current: currentIndex + 1, total: eventsNeedingRating.length }
    : null;

  return {
    modalState,
    submitRating,
    skipRating,
    canSkip,
    hasMoreEvents,
    progress
  };
};