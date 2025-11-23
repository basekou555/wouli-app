import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { WOULI_CATEGORIES as categories } from '../data/wouliCategories';
import { useAllEvents } from '@/hooks/useAllEvents';
import BottomNavigation from '../components/BottomNavigation';
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
      {/* Header avec Filtres */}
      <div className="bg-card p-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-gradient">Wouli</h1>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button 
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className="whitespace-nowrap"
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Event Card Container */}
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
              onFilterClick={() => {
                // TODO: Ouvrir drawer filtres (Phase 3)
                toast({
                  title: "Filtres",
                  description: "Drawer de filtres à venir (Phase 3)"
                });
              }}
            />
          )
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Aucun événement disponible dans cette catégorie</p>
            <Button 
              variant="outline" 
              onClick={() => handleCategoryChange('all')} 
              className="mt-4"
            >
              Voir tous les événements
            </Button>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};
export default UserApp;