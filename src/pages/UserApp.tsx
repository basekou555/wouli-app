import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Filter, Bell, Heart, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { WOULI_CATEGORIES as categories } from '../data/wouliCategories';
import { useAllEvents } from '@/hooks/useAllEvents';
import BottomNavigation from '../components/BottomNavigation';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import WouliEventCard from '@/components/cards/WouliEventCard';
const UserApp = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
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
    setShowFilters(false);
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
    <div className="flex flex-col h-screen bg-background">
      {/* Header fixe */}
      <header className="fixed top-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Wouli
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
            </Button>
            <Button 
              variant={showFilters ? "default" : "outline"} 
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

        {/* Filtres horizontaux dans le header */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
      </header>

      {/* Zone de swipe avec padding top pour header */}
      <div className="flex-1 pt-16 pb-32 px-2 flex items-center justify-center">
        {filteredEvents.length > 0 ? (
          <div className="w-full max-w-md mx-auto h-full relative">
            {/* Current Card */}
            {currentIndex < filteredEvents.length && (
              <div className="absolute inset-0 z-10 flex items-center">
                <WouliEventCard
                  event={filteredEvents[currentIndex]}
                  variant="swipe"
                  enableSwipe={true}
                  isLiked={likedEvents.includes(filteredEvents[currentIndex].id)}
                  isParticipating={participatingEvents.includes(filteredEvents[currentIndex].id)}
                  onLike={() => handleLike(filteredEvents[currentIndex].id)}
                  onDislike={handleDislike}
                  onSwipeLeft={handleDislike}
                  onSwipeRight={() => handleLike(filteredEvents[currentIndex].id)}
                  onParticipate={() => handleParticipate(filteredEvents[currentIndex].id)}
                  onCardClick={() => handleCardClick(filteredEvents[currentIndex].id)}
                  onShare={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: filteredEvents[currentIndex].title,
                        text: `Découvre cet événement : ${filteredEvents[currentIndex].title}`,
                        url: window.location.origin + `/events/${filteredEvents[currentIndex].id}`
                      });
                    }
                  }}
                />
              </div>
            )}
            
            {/* Next Card Preview */}
            {currentIndex + 1 < filteredEvents.length && (
              <div className="absolute inset-0 z-0 flex items-center transform scale-95 opacity-30">
                <WouliEventCard
                  event={filteredEvents[currentIndex + 1]}
                  variant="swipe"
                  enableSwipe={false}
                  isLiked={likedEvents.includes(filteredEvents[currentIndex + 1].id)}
                  isParticipating={participatingEvents.includes(filteredEvents[currentIndex + 1].id)}
                  onLike={() => {}}
                  onSwipeLeft={() => {}}
                  onSwipeRight={() => {}}
                  onParticipate={() => {}}
                  onCardClick={() => {}}
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

      {/* Boutons d'action fixes */}
      {filteredEvents.length > 0 && currentIndex < filteredEvents.length && (
        <div className="fixed bottom-20 left-0 right-0 px-8 z-40">
          <div className="flex items-center justify-center gap-6 bg-background/95 backdrop-blur-md rounded-full p-4 shadow-xl border border-border max-w-sm mx-auto">
            {/* Bouton Croix */}
            <Button 
              variant="outline" 
              size="lg"
              className="w-14 h-14 rounded-full bg-background hover:bg-muted shadow-lg border-2"
              onClick={handleDislike}
            >
              <X className="h-6 w-6 text-muted-foreground" />
            </Button>
            
            {/* Bouton Participer */}
            <Button 
              size="lg"
              className={`h-14 px-8 rounded-full shadow-lg font-semibold ${
                participatingEvents.includes(filteredEvents[currentIndex].id)
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white'
              }`}
              onClick={() => handleParticipate(filteredEvents[currentIndex].id)}
            >
              {participatingEvents.includes(filteredEvents[currentIndex].id) ? '✅ Inscrit' : 'Participer'}
            </Button>
            
            {/* Bouton Cœur */}
            <Button 
              variant="outline" 
              size="lg"
              className={`w-14 h-14 rounded-full shadow-lg border-2 ${
                likedEvents.includes(filteredEvents[currentIndex].id)
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'bg-background hover:bg-muted border-border'
              }`}
              onClick={() => handleLike(filteredEvents[currentIndex].id)}
            >
              <Heart className={`h-6 w-6 ${
                likedEvents.includes(filteredEvents[currentIndex].id) 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-muted-foreground'
              }`} />
            </Button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
export default UserApp;