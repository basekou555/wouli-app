import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAllEvents } from '@/hooks/useAllEvents';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import EventCard from '@/components/EventCard';
const UserApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [eventHistory, setEventHistory] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    events: allEvents,
    loading,
    likeEvent: handleLikeEvent,
    participateEvent: handleParticipateEvent,
    incrementViews: handleIncrementViews
  } = useAllEvents();

  // Filter events based on selected category
  const filteredEvents = selectedCategory === 'all' ? allEvents : allEvents.filter(event => event.category === selectedCategory);
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
  };
  const handleLike = async (eventId: string) => {
    if (!likedEvents.includes(eventId)) {
      setLikedEvents([...likedEvents, eventId]);
      await handleLikeEvent(eventId);
    }
    nextCard();
  };

  const handleParticipate = async (eventId: string) => {
    if (!participatingEvents.includes(eventId)) {
      setParticipatingEvents([...participatingEvents, eventId]);
      await handleParticipateEvent(eventId);
    }
    nextCard();
  };

  const handleDislike = () => {
    nextCard();
  };

  const handleCardClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const nextCard = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setEventHistory([...eventHistory, currentIndex]);
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: "C'est tout !",
        description: "Plus d'événements à découvrir pour le moment"
      });
      setCurrentIndex(0);
      setEventHistory([]);
    }
  };

  const handleBack = () => {
    if (eventHistory.length > 0) {
      const previousIndex = eventHistory[eventHistory.length - 1];
      setCurrentIndex(previousIndex);
      setEventHistory(eventHistory.slice(0, -1));
    }
  };
  const currentEvent = filteredEvents[currentIndex];
  if (loading) {
    return <PageSkeleton />;
  }
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Event Card Container - Plein écran */}
      <div className="flex-1 overflow-hidden">
        {filteredEvents.length > 0 ? (
          currentIndex < filteredEvents.length && (
            <EventCard
              event={filteredEvents[currentIndex]}
              isFirstEvent={eventHistory.length === 0}
              onBack={handleBack}
              onDislike={handleDislike}
              onLike={() => handleLike(filteredEvents[currentIndex].id)}
              onParticipate={() => handleParticipate(filteredEvents[currentIndex].id)}
              onShare={() => {
                if (navigator.share) {
                  navigator.share({
                    title: filteredEvents[currentIndex].title,
                    text: `Découvre cet événement : ${filteredEvents[currentIndex].title}`,
                    url: window.location.origin + `/events/${filteredEvents[currentIndex].id}`
                  });
                }
              }}
              onMenuClick={() => {
                toast({ title: "Menu", description: "À venir" });
              }}
              onSearchClick={() => {
                navigate('/search');
              }}
              onFilterClick={() => {
                toast({ title: "Filtres", description: "Drawer à venir (Phase 3)" });
              }}
            />
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">Aucun événement disponible</p>
              <Button onClick={() => setSelectedCategory('all')}>
                Voir tous les événements
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UserApp;