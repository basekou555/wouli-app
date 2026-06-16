import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePaginatedEvents } from '@/hooks/usePaginatedEvents';
import { useRecommendedFeed } from '@/hooks/useRecommendedFeed';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useSmartTracking } from '@/hooks/useSmartTracking';
import { usePreferenceLearning } from '@/hooks/usePreferenceLearning';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import EventCard from '@/components/EventCard';
import SwipeFeedEmpty from '@/components/SwipeFeedEmpty';
import BottomNavigation from '@/components/BottomNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuDrawer } from '@/components/MenuDrawer';
import { FiltersDrawer } from '@/components/FiltersDrawer';
import { InstallPrompt } from '@/components/InstallPrompt';
import FeedModeToggle from '@/components/FeedModeToggle';
import { Menu, Loader2, SlidersHorizontal, UserPlus, X } from 'lucide-react';
import { useIsPWA } from '@/hooks/useIsPWA';
import { useAuth } from '@/contexts/AuthContext';
import { useFriendships } from '@/hooks/useFriendships';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';

const UserApp = () => {
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [participatingEvents, setParticipatingEvents] = useState<Set<string>>(new Set());
  const [viewedEventIds, setViewedEventIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Pending friend suggestion (from referral link)
  const [pendingFriendUsername, setPendingFriendUsername] = useState<string | null>(null);
  const [pendingFriendId, setPendingFriendId] = useState<string | null>(null);
  const [showFriendSuggestion, setShowFriendSuggestion] = useState(false);

  // Conteneur du feed vertical (scroll snap TikTok-style)
  const containerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useAuth();
  const { sendFriendRequest } = useFriendships();

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

  const isPWA = useIsPWA();

  // Scroll vers une carte donnée (snap)
  const scrollToEvent = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    if (index < 0 || index > filteredEvents.length) return;
    container.scrollTo({ top: index * container.clientHeight, behavior: 'smooth' });
  }, [filteredEvents.length]);

  // Détecte la carte visible au scroll → met à jour currentIndex
  // (réutilisé par le view-tracking et le chargement infini ci-dessous)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const cardHeight = container.clientHeight;
        if (!cardHeight) return;
        const idx = Math.round(container.scrollTop / cardHeight);
        setCurrentIndex((prev) =>
          idx !== prev && idx >= 0 && idx < filteredEvents.length ? idx : prev,
        );
      }, 100);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [filteredEvents.length]);

  // Détecter suggestion d'ami depuis le flux référent
  useEffect(() => {
    const addFriendParam = searchParams.get('add_friend');
    if (!addFriendParam) return;

    const resolveFriend = async () => {
      const { data } = await supabase
        .from('public_profiles')
        .select('id, username')
        .eq('username', addFriendParam)
        .single();

      if (data) {
        setPendingFriendUsername(data.username);
        setPendingFriendId(data.id);
        setShowFriendSuggestion(true);
      }
      setSearchParams((prev) => { prev.delete('add_friend'); return prev; }, { replace: true });
    };

    resolveFriend();
  }, []);


  useEffect(() => {
    window.addEventListener('beforeunload', flushNow);
    return () => {
      window.removeEventListener('beforeunload', flushNow);
      flushNow();
    };
  }, [flushNow]);

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

  const handleResetFilters = () => {
    clearFilters();
    setCurrentIndex(0);
    containerRef.current?.scrollTo({ top: 0 });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId);
    setCurrentIndex(0);
    containerRef.current?.scrollTo({ top: 0 });
  };

  // Dislike → passe à la carte suivante
  const handleDislike = useCallback(async (event: UnifiedEvent, index: number) => {
    toast({ title: "Événement ignoré 👋", duration: 900 });
    const result = await trackInteraction(event.id, 'dislike', event);
    if (result) learnFromInteraction(result.signal, event);
    scrollToEvent(index + 1);
  }, [trackInteraction, learnFromInteraction, scrollToEvent, toast]);

  // Like
  const handleLike = useCallback(async (event: UnifiedEvent, index: number) => {
    if (likedEvents.has(event.id)) {
      setLikedEvents(prev => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
      return;
    }
    setLikedEvents(prev => new Set([...prev, event.id]));
    await handleLikeEvent(event.id);
    const result = await trackInteraction(event.id, 'like', event);
    if (result) learnFromInteraction(result.signal, event);
    toast({ title: "❤️ Liké !", duration: 900 });
    scrollToEvent(index + 1);
  }, [likedEvents, handleLikeEvent, trackInteraction, learnFromInteraction, scrollToEvent, toast]);

  // Participate
  const handleParticipate = useCallback(async (event: UnifiedEvent, index: number) => {
    if (participatingEvents.has(event.id)) {
      setParticipatingEvents(prev => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
      toast({ title: "Participation annulée", duration: 900 });
      return;
    }
    setParticipatingEvents(prev => new Set([...prev, event.id]));
    await handleParticipateEvent(event.id);
    const result = await trackInteraction(event.id, 'participate', event);
    if (result) learnFromInteraction(result.signal, event);
    toast({
      title: "✅ Tu participes !",
      description: `Rendez-vous ${event.location} 🎉`,
      duration: 2000,
    });
    setTimeout(() => scrollToEvent(index + 1), 500);
  }, [participatingEvents, handleParticipateEvent, trackInteraction, learnFromInteraction, scrollToEvent, toast]);

  const handleShare = useCallback(async (event: UnifiedEvent) => {
    const base = `${window.location.origin}/e/${event.id}`;
    const shareUrl = profile?.username ? `${base}?ref=${profile.username}` : base;

    const shareData = {
      title: `${event.title} - Wouli`,
      text: `Découvre cet événement : ${event.title}`,
      url: shareUrl,
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
  }, [toast, profile]);

  const handleEstablishmentClick = useCallback((event: UnifiedEvent) => {
    toast({
      title: event.venue || event.location || "Établissement",
      description: "Page établissement à venir",
    });
  }, [toast]);

  const handleMapClick = useCallback((event: UnifiedEvent) => {
    if (!event.address) {
      toast({ title: "Adresse non disponible", variant: "destructive" });
      return;
    }
    const encoded = encodeURIComponent(event.address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(
      isIOS
        ? `maps://maps.apple.com/?q=${encoded}`
        : `https://www.google.com/maps/search/?api=1&query=${encoded}`,
      '_blank'
    );
  }, [toast]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div
      className="relative bg-black overflow-hidden"
      style={{
        height: '100dvh',
        ['--app-header-h' as any]: 'calc(56px + env(safe-area-inset-top))',
        ['--app-nav-h' as any]: 'calc(60px + env(safe-area-inset-bottom))',
      }}
    >
      {/* Header flottant — transparent, par-dessus le feed plein écran */}
      <header
        className="absolute top-0 inset-x-0 z-40 h-14 px-4 flex items-center justify-between pointer-events-none"
        style={{ paddingTop: isPWA ? 'env(safe-area-inset-top)' : undefined }}
      >
        {/* Dégradé pour la lisibilité des contrôles */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />

        <button
          onClick={() => setIsMenuOpen(true)}
          className="relative w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-white active:bg-black/50 transition-colors pointer-events-auto"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative pointer-events-auto">
          <FeedModeToggle mode={feedMode} onModeChange={setFeedMode} />
        </div>

        <button
          onClick={() => setIsFiltersOpen(true)}
          className="relative px-3 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-white text-sm font-medium active:bg-black/50 transition-colors flex items-center gap-1 pointer-events-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </button>
      </header>

      {/* Feed vertical — scroll snap TikTok-style (une carte par écran), plein écran */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-scroll scroll-smooth scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {filteredEvents.length > 0 ? (
          <>
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="h-full"
                style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
                data-index={index}
              >
                <EventCard
                  event={event}
                  isFirstEvent={index === 0}
                  onBack={() => scrollToEvent(index - 1)}
                  onDislike={() => handleDislike(event, index)}
                  onLike={() => handleLike(event, index)}
                  onParticipate={() => handleParticipate(event, index)}
                  onShare={() => handleShare(event)}
                  onEstablishmentClick={() => handleEstablishmentClick(event)}
                  onMapClick={() => handleMapClick(event)}
                />
              </div>
            ))}

            {/* Indicateur de chargement */}
            {loadingMore && (
              <div
                className="h-full flex items-center justify-center bg-black"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              </div>
            )}

            {/* Carte de fin de scroll — restart / reset filtres / partage */}
            {!hasMore && (
              <div
                className="h-full"
                style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
              >
                <SwipeFeedEmpty
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={handleResetFilters}
                  onRestart={() => {
                    setCurrentIndex(0);
                    scrollToEvent(0);
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="h-full">
            <SwipeFeedEmpty
              hasActiveFilters={hasActiveFilters}
              onResetFilters={handleResetFilters}
              onRestart={() => {
                setCurrentIndex(0);
                scrollToEvent(0);
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom nav flottante — transparente par-dessus le feed plein écran */}
      <div className="absolute bottom-0 inset-x-0 z-40 pointer-events-none">
        <BottomNavigation variant="floating" />
      </div>

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

      {/* Bottom sheet suggestion d'ami (flux référent TikTok-style) */}
      <AnimatePresence>
        {showFriendSuggestion && pendingFriendUsername && pendingFriendId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowFriendSuggestion(false)}
            />
            <motion.div
              className="relative w-full bg-white rounded-t-2xl p-6 space-y-4"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <button
                onClick={() => setShowFriendSuggestion(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center gap-3 pt-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {pendingFriendUsername[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tu as découvert Wouli grâce à</p>
                  <p className="text-lg font-bold text-gray-900">{pendingFriendUsername}</p>
                </div>
                <p className="text-sm text-gray-500">Ajoute-le comme ami pour voir ses sorties !</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowFriendSuggestion(false)}
                >
                  Ignorer
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  onClick={async () => {
                    if (!pendingFriendId) return;
                    const ok = await sendFriendRequest(pendingFriendId);
                    if (ok) {
                      toast({ title: `Demande envoyée à ${pendingFriendUsername} !`, duration: 2000 });
                    }
                    setShowFriendSuggestion(false);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Ajouter en ami
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserApp;
