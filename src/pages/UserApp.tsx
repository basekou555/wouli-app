import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAllEvents } from '@/hooks/useAllEvents';
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

  const nextCard = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setEventHistory([...eventHistory, currentIndex]);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      // Incrémenter les vues de l'event suivant
      const nextEvent = filteredEvents[nextIndex];
      if (nextEvent) {
        handleIncrementViews(nextEvent.id);
      }
    }
    // Ne plus reset automatiquement - l'écran de fin gère ça
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
    toast({
      title: "Événement ignoré 👋",
      description: "On passe au suivant !",
      duration: 1500,
    });
    nextCard();
  };

  const handleShare = async () => {
    const event = filteredEvents[currentIndex];
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
  };

  const handleBack = () => {
    if (eventHistory.length > 0) {
      const previousIndex = eventHistory[eventHistory.length - 1];
      setCurrentIndex(previousIndex);
      setEventHistory(eventHistory.slice(0, -1));
    }
  };

  const handleResetList = () => {
    setCurrentIndex(0);
    setEventHistory([]);
  };

  const handleEstablishmentClick = () => {
    const event = filteredEvents[currentIndex];
    toast({
      title: event?.venue || event?.location || "Établissement",
      description: "Page établissement à venir"
    });
  };

  const handleMapClick = () => {
    const event = filteredEvents[currentIndex];
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
  };

  const currentEvent = filteredEvents[currentIndex];
  if (loading) {
    return <PageSkeleton />;
  }
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Event Card Container - Plein écran */}
      <div className="flex-1 overflow-hidden">
        {filteredEvents.length > 0 ? (
          currentIndex < filteredEvents.length ? (
            <EventCard
              event={filteredEvents[currentIndex]}
              isFirstEvent={eventHistory.length === 0}
              onBack={handleBack}
              onDislike={handleDislike}
              onLike={() => handleLike(filteredEvents[currentIndex].id)}
              onParticipate={() => handleParticipate(filteredEvents[currentIndex].id)}
              onShare={handleShare}
              onMenuClick={() => {
                toast({ title: "Menu", description: "À venir" });
              }}
              onSearchClick={() => {
                navigate('/search');
              }}
              onFilterClick={() => {
                toast({ title: "Filtres", description: "Drawer à venir (Phase 3)" });
              }}
              onEstablishmentClick={handleEstablishmentClick}
              onMapClick={handleMapClick}
            />
          ) : (
            // Écran fin de liste
            <div className="flex-1 flex items-center justify-center h-full p-8">
              <div className="text-center space-y-4">
                <span className="text-6xl">🎉</span>
                <p className="text-xl font-semibold">C'est tout pour aujourd'hui !</p>
                <p className="text-muted-foreground">
                  Plus d'événements à découvrir. Reviens demain !
                </p>
                <Button onClick={handleResetList} variant="outline">
                  Revoir depuis le début
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">Aucun événement disponible</p>
              <Button onClick={() => setSelectedCategory('all')}>
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