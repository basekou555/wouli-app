import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { usePaginatedEvents } from '@/hooks/usePaginatedEvents';
import { useRecommendedFeed } from '@/hooks/useRecommendedFeed';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useSmartTracking } from '@/hooks/useSmartTracking';
import { usePreferenceLearning } from '@/hooks/usePreferenceLearning';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import EventCard from '@/components/EventCard';
import SwipeFeedEmpty from '@/components/SwipeFeedEmpty';
import { motion } from 'framer-motion';
import { MenuDrawer } from '@/components/MenuDrawer';
import { FiltersDrawer } from '@/components/FiltersDrawer';
import { InstallPrompt } from '@/components/InstallPrompt';
import FeedModeToggle from '@/components/FeedModeToggle';
import { Menu, Loader2, SlidersHorizontal } from 'lucide-react';
import { useIsPWA } from '@/hooks/useIsPWA';

const UserApp = () => {
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [participatingEvents, setParticipatingEvents] = useState<Set<string>>(new Set());
  const [viewedEventIds, setViewedEventIds] = useState<Set<string>>(new Set());
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  
  // Drawer states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    events: allEvents,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    likeEvent: handleLikeEvent,
    participateEvent: handleParticipateEvent,
    incrementViews: handleIncrementViews
  } = usePaginatedEvents();

  // Recommendation engine integration
  const {
    recommendedEvents,
    feedMode,
    setFeedMode,
    getBadgesForEvent
  } = useRecommendedFeed(allEvents);

  // Unified filters - uses recommended or all events based on mode
  const baseEvents = feedMode === 'recommended' ? recommendedEvents : allEvents;
  const {
    selectedCategory,
    setSelectedCategory,
    selectedPrice,
    setSelectedPrice,
    selectedTime,
    setSelectedTime,
    filteredEvents,
    clearFilters,
    hasActiveFilters
  } = useSearchFilters(baseEvents);

  const { startViewTracking, stopViewTracking, trackInteraction } = useSmartTracking();
  const { learnFromInteraction, flushNow } = usePreferenceLearning();

  // Flush preferences when user leaves
  useEffect(() => {
    const handleUnload = () => { flushNow(); };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      flushNow();
    };
  }, [flushNow]);

  const isPWA = useIsPWA();
  
  // Hauteur du header fixe
  const HEADER_HEIGHT = 56; // h-14 = 3.5rem = 56px

  // Scroll programmatique vers un event
  const scrollToEvent = useCallback((targetIndex: number) => {
    if (!containerRef.current) return;
    
    // Limites
    if (targetIndex < 0 || targetIndex > filteredEvents.length) return;
    
    const container = containerRef.current;
    const cardHeight = container.clientHeight; // Hauteur visible du container (sans header)
    const targetY = targetIndex * cardHeight;
    
    container.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
    
    setCurrentScrollIndex(targetIndex);
  }, [filteredEvents.length]);

  // Tracking du scroll pour détecter l'event visible + charger plus
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let scrollTimeout: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const cardHeight = container.clientHeight;
        const currentIndex = Math.round(scrollTop / cardHeight);
        
        if (currentIndex !== currentScrollIndex && currentIndex < filteredEvents.length) {
          // Stop tracking previous event
          const prevEvent = filteredEvents[currentScrollIndex];
          if (prevEvent) stopViewTracking(prevEvent.id);

          setCurrentScrollIndex(currentIndex);

          // Start tracking new event
          const newEvent = filteredEvents[currentIndex];
          if (newEvent) {
            startViewTracking(newEvent.id);
            if (!viewedEventIds.has(newEvent.id)) {
              setViewedEventIds(prev => new Set([...prev, newEvent.id]));
              handleIncrementViews(newEvent.id);
            }
          }
        }

        // Charger plus quand on approche de la fin (3 events avant la fin)
        if (hasMore && !loadingMore && currentIndex >= filteredEvents.length - 3) {
          loadMore();
        }
      }, 150);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentScrollIndex, filteredEvents, viewedEventIds, handleIncrementViews, hasMore, loadingMore, loadMore]);

  // Incrémenter les vues du premier event au chargement
  useEffect(() => {
    if (filteredEvents.length > 0 && !viewedEventIds.has(filteredEvents[0].id)) {
      setViewedEventIds(prev => new Set([...prev, filteredEvents[0].id]));
      handleIncrementViews(filteredEvents[0].id);
    }
  }, [filteredEvents, viewedEventIds, handleIncrementViews]);
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
    setCurrentScrollIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    clearFilters();
    setCurrentScrollIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDislike = useCallback(async (eventId: string, currentIndex: number) => {
    const event = filteredEvents[currentIndex];
    if (event) {
      const result = await trackInteraction(eventId, 'dislike', event);
      if (result) learnFromInteraction(result.signal, event);
    }
    toast({ title: "Événement ignoré 👋", duration: 1000 });
    setTimeout(() => { scrollToEvent(currentIndex + 1); }, 300);
  }, [filteredEvents, trackInteraction, learnFromInteraction, scrollToEvent, toast]);

  const handleLike = useCallback(async (eventId: string, currentIndex: number) => {
    const event = filteredEvents[currentIndex];
    if (likedEvents.has(eventId)) {
      setLikedEvents(prev => { const n = new Set(prev); n.delete(eventId); return n; });
      toast({ title: "❤️ Like retiré", duration: 1000 });
    } else {
      setLikedEvents(prev => new Set([...prev, eventId]));
      await handleLikeEvent(eventId);
      if (event) {
        const result = await trackInteraction(eventId, 'like', event);
        if (result) learnFromInteraction(result.signal, event);
      }
      toast({ title: "❤️ Liké !", duration: 1000 });
    }
    setTimeout(() => { scrollToEvent(currentIndex + 1); }, 300);
  }, [filteredEvents, likedEvents, handleLikeEvent, trackInteraction, learnFromInteraction, scrollToEvent, toast]);

  const handleParticipate = useCallback(async (eventId: string, currentIndex: number) => {
    const currentEvent = filteredEvents[currentIndex];

    if (participatingEvents.has(eventId)) {
      setParticipatingEvents(prev => { const n = new Set(prev); n.delete(eventId); return n; });
      toast({ title: "Participation annulée", duration: 1000 });
    } else {
      setParticipatingEvents(prev => new Set([...prev, eventId]));
      await handleParticipateEvent(eventId);
      if (currentEvent) {
        const result = await trackInteraction(eventId, 'participate', currentEvent);
        if (result) learnFromInteraction(result.signal, currentEvent);
      }
      toast({
        title: "✅ Tu participes !",
        description: currentEvent ? `Rendez-vous ${currentEvent.location} 🎉` : undefined,
        duration: 2000,
      });
    }
    setTimeout(() => { scrollToEvent(currentIndex + 1); }, 500);
  }, [filteredEvents, participatingEvents, handleParticipateEvent, trackInteraction, learnFromInteraction, scrollToEvent, toast]);

  const handleShare = useCallback(async (eventId: string) => {
    const event = filteredEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const shareData = {
      title: `${event.title} - Wouli`,
      text: `Découvre cet événement : ${event.title}`,
      url: `${window.location.origin}/events/${event.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: "Événement partagé ! 🎉", duration: 1500 });
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Lien copié ! 📋",
          description: "Le lien a été copié dans le presse-papier",
          duration: 2000,
        });
      }
    } catch (error) {
      console.log('Share cancelled');
    }
    // Pas de scroll après partage
  }, [filteredEvents, toast]);

  const handleEstablishmentClick = useCallback((eventId: string) => {
    const event = filteredEvents.find(e => e.id === eventId);
    toast({
      title: event?.venue || event?.location || "Établissement",
      description: "Page établissement à venir"
    });
  }, [filteredEvents, toast]);

  const handleMapClick = useCallback((eventId: string) => {
    const event = filteredEvents.find(e => e.id === eventId);
    if (!event?.address) {
      toast({
        title: "Adresse non disponible",
        variant: "destructive"
      });
      return;
    }
    
    const encodedAddress = encodeURIComponent(event.address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`maps://maps.apple.com/?q=${encodedAddress}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  }, [filteredEvents, toast]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Header fixe - toujours visible */}
      <header 
        className="flex-shrink-0 h-14 px-4 flex items-center justify-between bg-card border-b border-border z-50"
        style={{ paddingTop: isPWA ? 'env(safe-area-inset-top)' : undefined }}
      >
        <button
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Feed Mode Toggle - replaces "WOULI" text */}
        <FeedModeToggle 
          mode={feedMode} 
          onModeChange={setFeedMode}
        />
        
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="px-3 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </button>
      </header>

      {/* Container avec Scroll Snap TikTok-style */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y-mandatory scroll-smooth scrollbar-hide"
      >
        {filteredEvents.length > 0 ? (
          <>
            {filteredEvents.map((event, index) => (
              <div 
                key={event.id}
                className="h-full snap-start snap-always"
                data-index={index}
              >
                <EventCard
                  event={event}
                  isFirstEvent={index === 0}
                  onBack={() => scrollToEvent(index - 1)}
                  onDislike={() => handleDislike(event.id, index)}
                  onLike={() => handleLike(event.id, index)}
                  onParticipate={() => handleParticipate(event.id, index)}
                  onShare={() => handleShare(event.id)}
                  onEstablishmentClick={() => handleEstablishmentClick(event.id)}
                  onMapClick={() => handleMapClick(event.id)}
                />
              </div>
            ))}
            
            {/* Loading indicator when loading more */}
            {loadingMore && (
              <div className="h-full snap-start snap-always flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              </div>
            )}
            
            {/* Écran de fin intelligent */}
            {!hasMore && (
              <div className="h-full snap-start snap-always">
                <SwipeFeedEmpty
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={handleResetFilters}
                  onRestart={() => scrollToEvent(0)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8 space-y-4">
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? "Aucun événement ne correspond à tes filtres"
                  : "Aucun événement disponible"}
              </p>
              {hasActiveFilters ? (
                <Button onClick={handleResetFilters}>
                  Réinitialiser les filtres
                </Button>
              ) : (
                <Button onClick={() => handleCategoryChange('all')}>
                  Voir tous les événements
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Install Prompt PWA */}
      <InstallPrompt pageId="swipe" delay={1000} />

      {/* Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Filters Drawer */}
      <FiltersDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        selectedCategory={selectedCategory || 'all'}
        onCategoryChange={handleCategoryChange}
        selectedPrice={selectedPrice}
        onPriceChange={setSelectedPrice}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        onReset={handleResetFilters}
      />
    </div>
  );
};

export default UserApp;
