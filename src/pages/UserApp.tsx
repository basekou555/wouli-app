import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAllEvents } from '@/hooks/useAllEvents';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import EventCard from '@/components/EventCard';
import { motion } from 'framer-motion';

const UserApp = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [participatingEvents, setParticipatingEvents] = useState<Set<string>>(new Set());
  const [viewedEventIds, setViewedEventIds] = useState<Set<string>>(new Set());
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
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
  const filteredEvents = selectedCategory === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.category === selectedCategory);

  // Scroll programmatique vers un event
  const scrollToEvent = useCallback((targetIndex: number) => {
    if (!containerRef.current) return;
    
    // Limites
    if (targetIndex < 0 || targetIndex > filteredEvents.length) return;
    
    const container = containerRef.current;
    const targetY = targetIndex * window.innerHeight;
    
    container.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
    
    setCurrentScrollIndex(targetIndex);
  }, [filteredEvents.length]);

  // Tracking du scroll pour détecter l'event visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let scrollTimeout: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const screenHeight = window.innerHeight;
        const currentIndex = Math.round(scrollTop / screenHeight);
        
        if (currentIndex !== currentScrollIndex && currentIndex < filteredEvents.length) {
          setCurrentScrollIndex(currentIndex);
          
          // Incrémenter les vues pour le nouvel event
          const newEvent = filteredEvents[currentIndex];
          if (newEvent && !viewedEventIds.has(newEvent.id)) {
            setViewedEventIds(prev => new Set([...prev, newEvent.id]));
            handleIncrementViews(newEvent.id);
          }
        }
      }, 150);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentScrollIndex, filteredEvents, viewedEventIds, handleIncrementViews]);

  // Incrémenter les vues du premier event au chargement
  useEffect(() => {
    if (filteredEvents.length > 0 && !viewedEventIds.has(filteredEvents[0].id)) {
      setViewedEventIds(prev => new Set([...prev, filteredEvents[0].id]));
      handleIncrementViews(filteredEvents[0].id);
    }
  }, [filteredEvents, viewedEventIds, handleIncrementViews]);
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentScrollIndex(0);
    scrollToEvent(0);
  };

  const handleDislike = useCallback((eventId: string, currentIndex: number) => {
    toast({
      title: "Événement ignoré 👋",
      duration: 1000,
    });
    
    setTimeout(() => {
      scrollToEvent(currentIndex + 1);
    }, 300);
  }, [scrollToEvent, toast]);

  const handleLike = useCallback(async (eventId: string, currentIndex: number) => {
    if (likedEvents.has(eventId)) {
      // Unlike
      setLikedEvents(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      toast({ title: "❤️ Like retiré", duration: 1000 });
    } else {
      // Like
      setLikedEvents(prev => new Set([...prev, eventId]));
      await handleLikeEvent(eventId);
      toast({ title: "❤️ Liké !", duration: 1000 });
    }

    setTimeout(() => {
      scrollToEvent(currentIndex + 1);
    }, 300);
  }, [likedEvents, handleLikeEvent, scrollToEvent, toast]);

  const handleParticipate = useCallback(async (eventId: string, currentIndex: number) => {
    const currentEvent = filteredEvents[currentIndex];
    
    if (participatingEvents.has(eventId)) {
      // Cancel participation
      setParticipatingEvents(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
      toast({ title: "Participation annulée", duration: 1000 });
    } else {
      // Participate
      setParticipatingEvents(prev => new Set([...prev, eventId]));
      await handleParticipateEvent(eventId);
      toast({
        title: "✅ Tu participes !",
        description: currentEvent ? `Rendez-vous ${currentEvent.location} 🎉` : undefined,
        duration: 2000,
      });
    }

    // Plus long delay pour voir l'animation
    setTimeout(() => {
      scrollToEvent(currentIndex + 1);
    }, 500);
  }, [filteredEvents, participatingEvents, handleParticipateEvent, scrollToEvent, toast]);

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
    <div className="h-screen bg-background overflow-hidden">
      {/* Container avec Scroll Snap TikTok-style */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y-mandatory scroll-smooth scrollbar-hide"
      >
        {filteredEvents.length > 0 ? (
          <>
            {filteredEvents.map((event, index) => (
              <div 
                key={event.id}
                className="h-screen snap-start snap-always"
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
                  onMenuClick={() => {
                    toast({ title: "Menu", description: "À venir" });
                  }}
                  onSearchClick={() => {
                    navigate('/search');
                  }}
                  onFilterClick={() => {
                    toast({ title: "Filtres", description: "Drawer à venir (Phase 3)" });
                  }}
                  onEstablishmentClick={() => handleEstablishmentClick(event.id)}
                  onMapClick={() => handleMapClick(event.id)}
                />
              </div>
            ))}
            
            {/* Écran de fin */}
            <div className="h-screen snap-start snap-always flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 p-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center text-white space-y-6"
              >
                <span className="text-6xl">🎉</span>
                <h2 className="text-3xl font-bold">C'est tout pour aujourd'hui !</h2>
                <p className="text-white/80 max-w-xs mx-auto">
                  Plus d'événements à découvrir. Reviens demain pour de nouvelles sorties !
                </p>
                
                <Button
                  onClick={() => scrollToEvent(0)}
                  variant="secondary"
                  className="mt-6 px-6 py-3 bg-white text-purple-600 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  ← Revoir depuis le début
                </Button>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">Aucun événement disponible</p>
              <Button onClick={() => handleCategoryChange('all')}>
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