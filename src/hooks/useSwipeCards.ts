
import { useState, useEffect } from 'react';
import { useAnimation, PanInfo } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { UnifiedEvent } from '@/types/unified';
import { useAllEvents } from '@/hooks/useAllEvents';

export const useSwipeCards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();
  const { toast } = useToast();
  const { events: allEvents, loading, error, refetch } = useAllEvents();
  const [filteredEvents, setFilteredEvents] = useState<UnifiedEvent[]>([]);

  useEffect(() => {
    setFilteredEvents(allEvents);
  }, [allEvents]);

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      // Swiped right (like)
      handleLike();
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left (pass)
      handlePass();
    } else {
      // Reset if not swiped far enough
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleLike = () => {
    controls.start({ 
      x: 300, 
      opacity: 0,
      transition: { duration: 0.3 } 
    }).then(() => {
      toast({
        title: "J'aime !",
        description: `Vous avez aimé "${filteredEvents[currentIndex]?.title}"`,
      });
      moveToNextCard();
    });
  };

  const handlePass = () => {
    controls.start({ 
      x: -300, 
      opacity: 0,
      transition: { duration: 0.3 } 
    }).then(() => {
      moveToNextCard();
    });
  };

  const handleSave = () => {
    toast({
      title: "Sauvegardé",
      description: `${filteredEvents[currentIndex]?.title} a été ajouté à vos favoris`,
    });
  };

  const moveToNextCard = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reached the end of the cards
      toast({
        title: "C'est tout !",
        description: "Vous avez parcouru tous les événements disponibles",
      });
      // Optionally restart or show end screen
      setCurrentIndex(0);
    }
    controls.start({ x: 0, opacity: 1 });
  };

  return {
    filteredEvents,
    loading,
    error,
    currentIndex,
    setCurrentIndex,
    controls,
    handleSwipe,
    handleLike,
    handlePass,
    handleSave,
    refetch
  };
};
