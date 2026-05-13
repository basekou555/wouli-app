import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { usePaginatedEvents } from '@/hooks/usePaginatedEvents';
import { useRecommendedFeed } from '@/hooks/useRecommendedFeed';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useSmartTracking } from '@/hooks/useSmartTracking';
import { usePreferenceLearning } from '@/hooks/usePreferenceLearning';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import SwipeCard from '@/components/user/swipe/SwipeCard';
import SwipeFeedEmpty from '@/components/SwipeFeedEmpty';
import BottomNavigation from '@/components/BottomNavigation';
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    incrementViews: handleIncrementViews,
  } = usePaginatedEvents();

  const { recommendedEvents, feedMode, setFeedMode } = useRecommendedFeed(allEvents);

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
    hasActiveFilters,
  } = useSearchFilters(baseEvents);

  const { trackInteraction } = useSmartTracking();
  const { learnFromInteraction, flushNow } = usePreferenceLearning();

  useEffect(() => {
    window.addEventListener('beforeunload', flushNow);
    return () => {
      window.removeEventListener('beforeunload', flushNow);
      flushNow();
    };
  }, [flushNow]);

  const isPWA = useIsPWA();

  const currentEvent = filteredEvents[currentIndex];
  const nextEvent = filteredEvents[currentIndex + 1];
  const isAtEnd = !currentEvent && !hasMore;
  const isLoadingNext = !currentEvent && hasMore;

  // Track view when the visible event changes
  useEffect(() => {
    const event = filteredEvents[currentIndex];
    if (event && !viewedEventIds.has(event.id)) {
      setViewedEventIds(prev => new Set([...prev, event.id]));
      handleIncrementViews(event.id);
    }
  }, [currentIndex, filteredEvents, viewedEventIds, handleIncrementViews]);

  // Preload more events before reaching the end
  useEffect(() => {
    if (hasMore && !loadingMore && currentIndex >= filteredEvents.length - 3) {
      loadMore();
    }
  }, [currentIndex, filteredEvents.length, hasMore, loadingMore, loadMore]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => prev + 1);
  }, []);

  const handleResetFilters = () => {
    clearFilters();
    setCurrentIndex(0);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
    setCurrentIndex(0);
  };

  // Called by SwipeCard AFTER the fly-left animation completes
  const onSwipeLeft = useCallback(async () => {
    const event = currentEvent;
    toast({ title: "Événement ignoré 👋", duration: 900 });
    if (event) {
      const result = await trackInteraction(event.id, 'dislike', event);
      if (result) learnFromInteraction(result.signal, event);
    }
    goToNext();
  }, [currentEvent, trackInteraction, learnFromInteraction, goToNext, toast]);

  // Called by SwipeCard AFTER the fly-right animation completes
  const onSwipeRight = useCallback(async () => {
    const event = currentEvent;
    if (!event) return;

    if (likedEvents.has(event.id)) {
      setLikedEvents(prev => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
    } else {
      setLikedEvents(prev => new Set([...prev, event.id]));
      await handleLikeEvent(event.id);
      const result = await trackInteraction(event.id, 'like', event);
      if (result) learnFromInteraction(result.signal, event);
      toast({ title: "❤️ Liké !", duration: 900 });
    }
    goToNext();
  }, [currentEvent, likedEvents, handleLikeEvent, trackInteraction, learnFromInteraction, goToNext, toast]);

  const onParticipate = useCallback(async () => {
    const event = currentEvent;
    if (!event) return;

    if (participatingEvents.has(event.id)) {
      setParticipatingEvents(prev => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
      toast({ title: "Participation annulée", duration: 900 });
    } else {
      setParticipatingEvents(prev => new Set([...prev, event.id]));
      await handleParticipateEvent(event.id);
      const result = await trackInteraction(event.id, 'participate', event);
      if (result) learnFromInteraction(result.signal, event);
      toast({
        title: "✅ Tu participes !",
        description: `Rendez-vous ${event.location} 🎉`,
        duration: 2000,
      });
    }
    setTimeout(goToNext, 500);
  }, [currentEvent, participatingEvents, handleParticipateEvent, trackInteraction, learnFromInteraction, goToNext, toast]);

  const onShare = useCallback(async () => {
    const event = currentEvent;
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
        toast({ title: "Lien copié ! 📋", duration: 2000 });
      }
    } catch {
      // Share cancelled — no action needed
    }
  }, [currentEvent, toast]);

  const onEstablishmentClick = useCallback(() => {
    if (!currentEvent) return;
    toast({
      title: currentEvent.venue || currentEvent.location || "Établissement",
      description: "Page établissement à venir",
    });
  }, [currentEvent, toast]);

  const onMapClick = useCallback(() => {
    if (!currentEvent?.address) {
      toast({ title: "Adresse non disponible", variant: "destructive" });
      return;
    }
    const encoded = encodeURIComponent(currentEvent.address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(
      isIOS
        ? `maps://maps.apple.com/?q=${encoded}`
        : `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      '_blank'
    );
  }, [currentEvent, toast]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div
      className="bg-background overflow-hidden flex flex-col"
      style={{ height: '100dvh' }}
    >
      {/* Fixed header */}
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

        <FeedModeToggle mode={feedMode} onModeChange={setFeedMode} />

        <button
          onClick={() => setIsFiltersOpen(true)}
          className="px-3 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </button>
      </header>

      {/* Card stack — takes all remaining height */}
      <div className="relative flex-1 overflow-hidden">
        {/* Next card peeking behind — stationary, no interaction */}
        {nextEvent && (
          <div className="absolute inset-0 scale-95 opacity-60 pointer-events-none origin-bottom">
            <div className="absolute inset-0 bg-card rounded-t-2xl" />
          </div>
        )}

        {/* Current card */}
        {currentEvent ? (
          <SwipeCard
            key={currentEvent.id}
            event={currentEvent}
            isFirstEvent={currentIndex === 0}
            onSwipeLeft={onSwipeLeft}
            onSwipeRight={onSwipeRight}
            onParticipate={onParticipate}
            onShare={onShare}
            onEstablishmentClick={onEstablishmentClick}
            onMapClick={onMapClick}
          />
        ) : isLoadingNext ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Chargement...</p>
            </div>
          </div>
        ) : isAtEnd ? (
          <SwipeFeedEmpty
            hasActiveFilters={hasActiveFilters}
            onResetFilters={handleResetFilters}
            onRestart={() => setCurrentIndex(0)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 space-y-4">
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "Aucun événement ne correspond à tes filtres"
                  : "Aucun événement disponible"}
              </p>
              {hasActiveFilters ? (
                <Button onClick={handleResetFilters}>Réinitialiser les filtres</Button>
              ) : (
                <Button onClick={() => handleCategoryChange('all')}>
                  Voir tous les événements
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation variant="inline" />

      <InstallPrompt pageId="swipe" delay={1000} />

      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

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
