import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { WOULI_CATEGORIES as categories } from '../data/wouliCategories';
import { useAllEvents } from '@/hooks/useAllEvents';

import { PageSkeleton } from '@/components/LoadingSkeleton';
import WouliEventCard from '@/components/cards/WouliEventCard';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ChevronDown, Check, X, Menu } from "lucide-react";

const UserAppGridTest = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    events: allEvents,
    loading,
    likeEvent: handleLikeEvent,
    participateEvent: handleParticipateEvent,
  } = useAllEvents();

  const filteredEvents = selectedCategory === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.category === selectedCategory);

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

  // Fermer le menu au clic extérieur
  React.useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Zone 1 : Header Compact */}
      <div className="bg-card px-4 py-2 border-b border-border flex items-center justify-between">
        {/* Gauche : Bouton Filtres avec catégorie active */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <span className="text-lg">
            {categories.find(c => c.id === selectedCategory)?.icon || '🎯'}
          </span>
          <span className="text-sm font-medium">
            {categories.find(c => c.id === selectedCategory)?.name || 'Filtres'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {/* Droite : Badge TEST + Menu Hamburger */}
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">TEST</Badge>
          
          {/* Menu flottant */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-10 h-10 rounded-full bg-background shadow-md flex items-center justify-center hover:bg-accent transition-all"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute top-12 right-0 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50">
                <button
                  onClick={() => {
                    navigate('/search');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 transition-colors"
                >
                  <span className="text-sm font-medium">🔍 Rechercher</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/explore');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 transition-colors"
                >
                  <span className="text-sm font-medium">🗺️ Explorer</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 transition-colors"
                >
                  <span className="text-sm font-medium">👤 Profil</span>
                </button>

                <div className="border-t border-border" />

                <button
                  onClick={() => {
                    navigate('/app');
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-accent flex items-center gap-3 transition-colors"
                >
                  <span className="text-sm font-medium text-primary">← Version stable</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zone 2 : Swipe Plein Écran */}
      <div className="flex-1 flex items-start justify-center px-3 pt-4 overflow-hidden">
        {filteredEvents.length > 0 ? (
          <div className="relative w-full max-w-[400px] mx-auto max-h-full flex items-start justify-center">
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
                />
              </div>
            )}
            
            {/* Next Card Preview */}
            {currentIndex + 1 < filteredEvents.length && (
              <div className="absolute inset-0 z-0 transform scale-95 opacity-50 pointer-events-none">
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

      {/* Zone 3 : Boutons Flottants - Séparés de la zone swipe */}
      <div className="flex-shrink-0 pb-8">
        {filteredEvents.length > 0 && currentIndex < filteredEvents.length && (
          <div className="flex justify-center items-center gap-6 px-4">
            {/* Bouton Dislike */}
            <button
              onClick={handleDislike}
              className="w-16 h-16 rounded-full bg-background shadow-lg flex items-center justify-center text-red-500 hover:bg-accent active:scale-95 transition-all border border-border"
              aria-label="Passer"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Bouton Like */}
            <button
              onClick={() => handleLike(filteredEvents[currentIndex].id)}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all"
              aria-label="J'aime"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>

            {/* Bouton Participer */}
            <button
              onClick={() => handleParticipate(filteredEvents[currentIndex].id)}
              className="w-16 h-16 rounded-full bg-background shadow-lg flex items-center justify-center text-green-500 hover:bg-accent active:scale-95 transition-all border border-border"
              aria-label="Participer"
            >
              <Check className="h-8 w-8" />
            </button>
          </div>
        )}
      </div>

      {/* Drawer Filtres */}
      <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Catégories</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategoryChange(category.id);
                  setIsFilterDrawerOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${selectedCategory === category.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                  }
                `}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                {selectedCategory === category.id && (
                  <Check className="w-5 h-5 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default UserAppGridTest;
