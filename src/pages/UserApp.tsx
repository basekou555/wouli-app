import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { WOULI_CATEGORIES as categories } from '../data/wouliCategories';
import { useAllEventsWithFriends } from '@/hooks/useAllEventsWithFriends';
import BottomNavigation from '../components/BottomNavigation';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import EventCardCompact from '@/components/cards/EventCardCompact';
const UserApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    events: allEvents,
    loading,
    handleLike: handleLikeEvent,
    handleParticipate: handleParticipateEvent,
    handleIncrementViews
  } = useAllEventsWithFriends();

  // Filter events based on selected category
  const filteredEvents = selectedCategory === 'all' ? allEvents : allEvents.filter(event => event.category === selectedCategory);
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
    setShowFilters(false);
  };
  const handleLike = async (eventId: string) => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    if (!likedEvents.includes(eventId)) {
      setLikedEvents([...likedEvents, eventId]);
      await handleLikeEvent(eventId);
    }
    
    // Slide animation to the right
    const cardElement = document.querySelector('.current-card');
    if (cardElement) {
      cardElement.classList.add('animate-slide-right');
      setTimeout(() => {
        nextCard();
        setIsAnimating(false);
      }, 400);
    } else {
      nextCard();
      setIsAnimating(false);
    }
  };

  const handleParticipate = async (eventId: string) => {
    if (!participatingEvents.includes(eventId)) {
      setParticipatingEvents([...participatingEvents, eventId]);
      await handleParticipateEvent(eventId);
    }
    nextCard();
  };

  const handleDislike = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    // Slide animation to the left
    const cardElement = document.querySelector('.current-card');
    if (cardElement) {
      cardElement.classList.add('animate-slide-left');
      setTimeout(() => {
        nextCard();
        setIsAnimating(false);
      }, 400);
    } else {
      nextCard();
      setIsAnimating(false);
    }
  };

  const handleCardClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const nextCard = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: "C'est tout !",
        description: "Plus d'événements à découvrir pour le moment"
      });
      setCurrentIndex(0);
    }
  };
  const currentEvent = filteredEvents[currentIndex];
  if (loading) {
    return <PageSkeleton />;
  }
  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <div className="bg-card shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Wouli</h1>
            <p className="text-muted-foreground text-sm">Découvre des événements près de toi</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowFilters(!showFilters)} 
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {selectedCategory !== 'all' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border-b p-4">
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
      )}

      {/* Card Stack Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm relative">
          {filteredEvents.length > 0 ? (
            <div className="relative h-[600px]">
              {/* Current Card */}
              {currentIndex < filteredEvents.length && (
                <div className="absolute inset-0 z-10 current-card">
                  <EventCardCompact
                    event={filteredEvents[currentIndex]}
                    isLiked={likedEvents.includes(filteredEvents[currentIndex].id)}
                    isParticipating={participatingEvents.includes(filteredEvents[currentIndex].id)}
                    onLike={() => handleLike(filteredEvents[currentIndex].id)}
                    onParticipate={() => handleParticipate(filteredEvents[currentIndex].id)}
                    onDislike={handleDislike}
                    onCardClick={() => handleCardClick(filteredEvents[currentIndex].id)}
                    animate={true}
                  />
                </div>
              )}
              
              {/* Next Card Preview */}
              {currentIndex + 1 < filteredEvents.length && (
                <div className="absolute inset-0 z-0 transform scale-95 opacity-50 animate-slide-up-ease">
                  <EventCardCompact
                    event={filteredEvents[currentIndex + 1]}
                    isLiked={likedEvents.includes(filteredEvents[currentIndex + 1].id)}
                    isParticipating={participatingEvents.includes(filteredEvents[currentIndex + 1].id)}
                    onLike={() => {}}
                    onParticipate={() => {}}
                    onDislike={() => {}}
                    onCardClick={() => handleCardClick(filteredEvents[currentIndex + 1].id)}
                  />
                </div>
              )}
            </div>
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
      </div>

      <BottomNavigation />
    </div>
  );
};
export default UserApp;