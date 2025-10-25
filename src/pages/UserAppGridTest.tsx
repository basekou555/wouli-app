import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { WOULI_CATEGORIES as categories } from '../data/wouliCategories';
import { useAllEvents } from '@/hooks/useAllEvents';
import BottomNavigation from '../components/BottomNavigation';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import WouliEventCard from '@/components/cards/WouliEventCard';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ChevronDown, Check, X } from "lucide-react";

const UserAppGridTest = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
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

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div 
      className="bg-background overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: 'var(--app-height)',
        paddingTop: 'var(--safe-top)'
      }}
    >
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
        
        {/* Droite : Badge TEST + Bouton retour */}
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">TEST</Badge>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Zone 2 : Swipe Cards avec contraintes strictes */}
      <div 
        className="relative overflow-hidden px-3 flex items-center justify-center"
        style={{
          maxHeight: 'calc(100vh - 120px)',
          minHeight: '400px'
        }}
      >
        <div 
          className="relative w-full max-w-[400px]" 
          style={{ 
            height: '100%',
            maxHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
            {filteredEvents.length > 0 ? (
              <>
                {/* Current Card */}
                {currentIndex < filteredEvents.length && (
                  <div className="absolute inset-0 z-10 flex items-center">
                    <div className="w-full" style={{ maxHeight: '100%', overflow: 'hidden' }}>
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
                      className="max-h-full"
                    />
                    </div>
                  </div>
                )}
                
                {/* Next Card Preview */}
                {currentIndex + 1 < filteredEvents.length && (
                  <div className="absolute inset-0 z-0 transform scale-95 opacity-50 pointer-events-none flex items-center">
                    <div className="w-full" style={{ maxHeight: '100%', overflow: 'hidden' }}>
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
                      className="max-h-full"
                    />
                    </div>
                  </div>
                )}
              </>
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

      {/* Zone 3 : BottomNavigation en mode inline */}
      <BottomNavigation variant="inline" />

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
