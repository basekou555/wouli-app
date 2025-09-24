import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bell, Heart, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { WOULI_CATEGORIES as categories } from '../data/wouliCategories';
import { useAllEvents } from '@/hooks/useAllEvents';
import { useSimpleEventInteractions } from '@/hooks/useSimpleEventInteractions';
import { useAuth } from '../contexts/AuthContext';
import { useRealTimeEvents } from '../hooks/useRealTimeEvents';
import { supabase } from '@/integrations/supabase/client';
import BottomNavigation from '../components/BottomNavigation';
import WouliEventCard from '@/components/cards/WouliEventCard';
const UserApp = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    events: allEvents,
    loading,
    error,
    refetch
  } = useAllEvents();

  const { handleLike: simpleLike, handleParticipate: simpleParticipate, handleIncrementViews } = useSimpleEventInteractions();
  const [userInteractions, setUserInteractions] = useState<{
    liked: Set<string>;
    participating: Set<string>;
  }>({
    liked: new Set(),
    participating: new Set()
  });

  // Filter events based on selected category
  const filteredEvents = useMemo(() => {
    return selectedCategory === 'all' ? allEvents : allEvents.filter(event => event.category === selectedCategory);
  }, [allEvents, selectedCategory]);

  // Set up real-time updates for event stats
  useRealTimeEvents(filteredEvents, refetch);

  // Redirection vers auth si pas connecté
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('👤 Utilisateur non connecté, redirection vers /auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load user interaction status for current events
  useEffect(() => {
    const loadInteractionStatus = async () => {
      if (!user || !session || !filteredEvents.length) {
        setUserInteractions({ liked: new Set(), participating: new Set() });
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          navigate('/auth');
          return;
        }

        const eventIds = filteredEvents.map(event => event.id);

        const { data: likesData } = await supabase
          .from('event_likes')
          .select('event_id')
          .eq('user_id', user.id)
          .in('event_id', eventIds);

        const { data: participationsData } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', user.id)
          .in('event_id', eventIds);

        const liked = new Set(likesData?.map(item => item.event_id) || []);
        const participating = new Set(participationsData?.map(item => item.event_id) || []);

        setUserInteractions({ liked, participating });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des statuts:', error);
        setUserInteractions({ liked: new Set(), participating: new Set() });
      }
    };

    loadInteractionStatus();
  }, [filteredEvents, user, session, navigate]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
    setShowFilters(false);
  };
  const handleLike = async (eventId: string) => {
    if (!user || !session) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour aimer des événements",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    const event = filteredEvents.find(e => e.id === eventId);
    const success = await simpleLike(eventId, event?.title);
    if (success) {
      setUserInteractions(prev => ({
        ...prev,
        liked: new Set([...prev.liked, eventId])
      }));
      
      setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
      await refetch();
    }
  };

  const handleParticipate = async (eventId: string) => {
    if (!user || !session) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour participer à des événements",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    const event = filteredEvents.find(e => e.id === eventId);
    const success = await simpleParticipate(eventId, event?.title);
    if (success) {
      setUserInteractions(prev => ({
        ...prev,
        participating: new Set([...prev.participating, eventId])
      }));
      await refetch();
    }
  };

  const handleDislike = () => {
    setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
  };

  const handleSwipeLeft = () => {
    setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
  };

  const handleSwipeRight = async (eventId: string) => {
    setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
    
    setUserInteractions(prev => ({
      ...prev,
      liked: new Set([...prev.liked, eventId])
    }));

    const event = filteredEvents.find(e => e.id === eventId);
    await simpleLike(eventId, event?.title);
    await refetch();
  };

  const handleViewEvent = async (eventId: string) => {
    await handleIncrementViews(eventId);
  };
  // Affichage du loading pendant l'authentification
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  // Redirection si pas connecté
  if (!user || !session) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Chargement des événements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="mb-4">{error?.message || 'Une erreur est survenue'}</p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header fixe */}
      <header className="fixed top-0 w-full bg-white border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo à gauche */}
          <div>
            <h1 className="text-2xl font-bold text-gradient">Wouli</h1>
          </div>
          
          {/* Notifications + Filtres à droite */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {/* Badge pour nouvelles notifications (exemple) */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>
            
            {/* Filtres horizontaux */}
            <div className="flex items-center space-x-2">
              {showFilters ? (
                <div className="flex gap-2 overflow-x-auto max-w-[200px]">
                  {categories.slice(0, 3).map(category => (
                    <Button 
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(category.id)}
                      className="whitespace-nowrap text-xs"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(true)}
                  className="text-xs"
                >
                  Filtres
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Zone de swipe avec padding top pour header */}
      <div className="flex-1 pt-16 pb-32 px-2">
        <div className="max-w-md mx-auto h-full flex items-center justify-center">
          {filteredEvents.length > 0 ? (
            <div className="relative w-full">
              {/* Current Card */}
              {currentIndex < filteredEvents.length && (
                <div className="w-full">
                  <WouliEventCard
                    event={filteredEvents[currentIndex]}
                    variant="swipe"
                    enableSwipe={true}
                    isLiked={userInteractions.liked.has(filteredEvents[currentIndex].id)}
                    isParticipating={userInteractions.participating.has(filteredEvents[currentIndex].id)}
                    onLike={() => handleLike(filteredEvents[currentIndex].id)}
                    onParticipate={() => handleParticipate(filteredEvents[currentIndex].id)}
                    onDislike={handleDislike}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={() => handleSwipeRight(filteredEvents[currentIndex].id)}
                    onCardClick={() => handleViewEvent(filteredEvents[currentIndex].id)}
                    onShare={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: filteredEvents[currentIndex].title,
                          text: `Découvre ${filteredEvents[currentIndex].title} sur Wouli !`,
                          url: window.location.href
                        });
                      }
                    }}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* Message de fin */}
              {currentIndex >= filteredEvents.length && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Plus d'événements à découvrir !</p>
                  <Button onClick={() => setCurrentIndex(0)} className="mt-4">
                    Recommencer
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Aucun événement disponible</p>
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
      
      {/* Boutons fixes au-dessus de la nav */}
      {currentIndex < filteredEvents.length && filteredEvents.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 px-8 z-40">
          <div className="flex justify-center space-x-6">
            {/* Dislike */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwipeLeft}
              className="rounded-full bg-white/90 backdrop-blur-sm border-2 w-14 h-14 shadow-lg"
            >
              <X className="h-6 w-6 text-red-500" />
            </Button>
            
            {/* Participer (bouton central plus large) */}
            <Button
              onClick={() => handleParticipate(filteredEvents[currentIndex].id)}
              disabled={userInteractions.participating.has(filteredEvents[currentIndex].id)}
              className={`rounded-full h-14 px-6 font-semibold shadow-lg ${
                userInteractions.participating.has(filteredEvents[currentIndex].id)
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
            >
              {userInteractions.participating.has(filteredEvents[currentIndex].id) ? '✅ Inscrit' : 'Participer'}
            </Button>
            
            {/* Like */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSwipeRight(filteredEvents[currentIndex].id)}
              className="rounded-full bg-white/90 backdrop-blur-sm border-2 w-14 h-14 shadow-lg"
            >
              <Heart className={`h-6 w-6 ${userInteractions.liked.has(filteredEvents[currentIndex].id) ? 'fill-current text-red-500' : 'text-red-500'}`} />
            </Button>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};
export default UserApp;