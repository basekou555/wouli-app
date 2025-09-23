import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, X, Star, Heart } from 'lucide-react';
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
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col relative overflow-hidden">
      {/* Header fixe (5% hauteur) - Z-50 */}
      <div className="fixed top-0 left-0 right-0 h-[5vh] bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center px-4 z-50">
        {/* Notifications à gauche */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-10 h-10 text-white hover:bg-white/10 relative"
        >
          <Bell className="h-5 w-5" />
          {/* Badge notification */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </Button>
        
        {/* Filtres horizontaux scrollables */}
        <div className="flex-1 ml-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {/* Filtres rapides */}
            <Button 
              variant={selectedCategory === 'all' ? "default" : "ghost"}
              size="sm"
              onClick={() => handleCategoryChange('all')}
              className={`whitespace-nowrap text-sm ${
                selectedCategory === 'all' 
                  ? 'bg-white text-black' 
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              Tout
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-sm text-white/80 hover:bg-white/10"
            >
              Ce soir
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-sm text-white/80 hover:bg-white/10"
            >
              Demain
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="whitespace-nowrap text-sm text-white/80 hover:bg-white/10"
            >
              Gratuit
            </Button>
            {categories.slice(0, 4).map(category => (
              <Button 
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className={`whitespace-nowrap text-sm ${
                  selectedCategory === category.id 
                    ? 'bg-white text-black' 
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Zone carte immersive (85% hauteur) - Padding minimal */}
      <div className="mt-[5vh] h-[85vh] p-2 flex items-center justify-center">
        {filteredEvents.length > 0 ? (
          <div className="w-full max-w-md h-full relative">
            {/* Current Card */}
            {currentIndex < filteredEvents.length && (
              <div className="absolute inset-0 z-10">
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
                  className="h-full"
                />
              </div>
            )}
            
            {/* Next Card Preview */}
            {currentIndex + 1 < filteredEvents.length && (
              <div className="absolute inset-0 z-0 transform scale-95 opacity-30 pointer-events-none">
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
                  onCardClick={() => handleCardClick(filteredEvents[currentIndex + 1].id)}
                  className="h-full"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-white/60 text-lg mb-4">
              Aucun événement disponible dans cette catégorie
            </p>
            <Button 
              variant="outline" 
              onClick={() => handleCategoryChange('all')} 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Voir tous les événements
            </Button>
          </div>
        )}
      </div>

      {/* Boutons d'action fixes (5% hauteur) - Z-40 */}
      {currentEvent && (
        <div className="fixed bottom-[5vh] left-0 right-0 h-[5vh] flex items-center justify-center gap-8 px-8 z-40">
          {/* Bouton Dislike - ❌ */}
          <Button 
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full bg-white/10 border-white/20 hover:bg-red-500/20 hover:border-red-500/40 backdrop-blur-sm"
            onClick={handleDislike}
          >
            <X className="h-6 w-6 text-white" />
          </Button>
          
          {/* Bouton Save - ⭐ */}
          <Button 
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full bg-white/10 border-white/20 hover:bg-yellow-500/20 hover:border-yellow-500/40 backdrop-blur-sm"
            onClick={() => handleParticipate(currentEvent.id)}
          >
            <Star className={`h-6 w-6 ${participatingEvents.includes(currentEvent.id) ? 'text-yellow-500 fill-yellow-500' : 'text-white'}`} />
          </Button>
          
          {/* Bouton Like - ❤️ */}
          <Button 
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full bg-white/10 border-white/20 hover:bg-green-500/20 hover:border-green-500/40 backdrop-blur-sm"
            onClick={() => handleLike(currentEvent.id)}
          >
            <Heart className={`h-6 w-6 ${likedEvents.includes(currentEvent.id) ? 'text-green-500 fill-green-500' : 'text-white'}`} />
          </Button>
        </div>
      )}

      {/* Navigation (5% hauteur) - Ne pas toucher - Z-50 */}
      <div className="fixed bottom-0 left-0 right-0 h-[5vh] z-50">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default UserApp;