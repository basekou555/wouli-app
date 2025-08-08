
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import WouliEventCard from '../components/cards/WouliEventCard';
import ExploreHeader from '../components/explore/ExploreHeader';
import ExploreFilters from '../components/explore/ExploreFilters';
import EmptyState from '../components/explore/EmptyState';
import { useAllEvents } from '../hooks/useAllEvents';
import { useExploreFilters } from '../hooks/useExploreFilters';
import { useSimpleEventInteractions } from '../hooks/useSimpleEventInteractions';
import { useAuth } from '../contexts/AuthContext';
import { useRealTimeEvents } from '../hooks/useRealTimeEvents';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

const Explore = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const {
    events: allEvents,
    loading,
    error,
    refetch
  } = useAllEvents();
  
  const {
    selectedCategory,
    searchTerm,
    showFilters,
    handleCategoryChange,
    handleSearchChange,
    toggleFilters,
    clearFilters
  } = useExploreFilters();

  // Filter events based on search and category
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = !searchTerm || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || event.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [allEvents, searchTerm, selectedCategory]);

  const { handleLike: simpleLike, handleParticipate: simpleParticipate, handleIncrementViews } = useSimpleEventInteractions();
  const [userInteractions, setUserInteractions] = useState<{
    liked: Set<string>;
    participating: Set<string>;
  }>({
    liked: new Set(),
    participating: new Set()
  });

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
        console.log('👤 Pas d\'utilisateur connecté, de session ou d\'événements');
        setUserInteractions({ liked: new Set(), participating: new Set() });
        return;
      }

      console.log('🔄 Chargement du statut d\'interaction pour', filteredEvents.length, 'événements');

      try {
        // Vérifier l'état de la session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          console.error('❌ Session expirée lors du chargement des interactions');
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        const eventIds = filteredEvents.map(event => event.id);

        // Récupérer les likes de l'utilisateur pour ces événements
        console.log('📋 Récupération des likes...');
        const { data: likesData, error: likesError } = await supabase
          .from('event_likes')
          .select('event_id')
          .eq('user_id', user.id)
          .in('event_id', eventIds);

        if (likesError) {
          console.error('❌ Erreur lors de la récupération des likes:', likesError);
          if (likesError.message.includes('row-level security')) {
            toast({
              title: "Erreur d'autorisation",
              description: "Problème d'accès aux données. Reconnectez-vous.",
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }
        }

        // Récupérer les participations de l'utilisateur pour ces événements
        console.log('📋 Récupération des participations...');
        const { data: participationsData, error: participationsError } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', user.id)
          .in('event_id', eventIds);

        if (participationsError) {
          console.error('❌ Erreur lors de la récupération des participations:', participationsError);
          if (participationsError.message.includes('row-level security')) {
            toast({
              title: "Erreur d'autorisation",
              description: "Problème d'accès aux données. Reconnectez-vous.",
              variant: "destructive"
            });
            navigate('/auth');
            return;
          }
        }

        const liked = new Set(likesData?.map(item => item.event_id) || []);
        const participating = new Set(participationsData?.map(item => item.event_id) || []);

        console.log('📊 Statuts chargés - Likés:', liked.size, 'Participants:', participating.size);
        setUserInteractions({ liked, participating });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des statuts d\'interaction:', error);
        setUserInteractions({ liked: new Set(), participating: new Set() });
        toast({
          title: "Erreur",
          description: "Impossible de charger les statuts d'interaction",
          variant: "destructive"
        });
      }
    };

    loadInteractionStatus();
  }, [filteredEvents, user, session, toast, navigate]);

  const handleLike = async (eventId: string) => {
    if (!user || !session) {
      console.log('⚠️ Utilisateur non connecté pour le like');
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour aimer des événements",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    console.log('❤️ Tentative de like dans Explore pour:', eventId);
    
    const event = filteredEvents.find(e => e.id === eventId);
    const success = await simpleLike(eventId, event?.title);
    if (success) {
      console.log('✅ Like réussi, mise à jour de l\'état local');
      setUserInteractions(prev => ({
        ...prev,
        liked: new Set([...prev.liked, eventId])
      }));
      
      // Move to next card
      setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
      
      await refetch(); // Refetch pour mettre à jour les compteurs
    }
  };

  const handleParticipate = async (eventId: string) => {
    if (!user || !session) {
      console.log('⚠️ Utilisateur non connecté pour la participation');
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour participer à des événements",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    console.log('🎉 Tentative de participation dans Explore pour:', eventId);
    
    const event = filteredEvents.find(e => e.id === eventId);
    const success = await simpleParticipate(eventId, event?.title);
    if (success) {
      console.log('✅ Participation réussie, mise à jour de l\'état local');
      setUserInteractions(prev => ({
        ...prev,
        participating: new Set([...prev.participating, eventId])
      }));
      await refetch(); // Refetch pour mettre à jour les compteurs
    }
  };
  
  const handleDislike = () => {
    setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
  };

  const handleViewEvent = async (eventId: string) => {
    console.log('👁️ Vue d\'événement dans Explore pour:', eventId);
    await handleIncrementViews(eventId);
  };

  const currentEvent = filteredEvents[currentIndex];

  // Affichage du loading pendant l'authentification
  if (authLoading) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          Vérification de l'authentification...
        </div>
      </AppLayout>
    );
  }

  // Redirection si pas connecté (sera gérée par l'useEffect)
  if (!user || !session) {
    return null;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          Chargement des événements...
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-red-500">
          <p className="mb-4">{error?.message || 'Une erreur est survenue'}</p>
          <button 
            onClick={() => refetch()} 
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Réessayer
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        <ExploreHeader 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onToggleFilters={toggleFilters}
          onClearFilters={clearFilters}
        />

        {showFilters && (
          <ExploreFilters 
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        )}

        <div className="flex-1 flex items-center justify-center p-4 relative">
          {filteredEvents.length > 0 && (
            <div className="relative w-full max-w-sm mx-auto h-[600px]">
              {/* Stack of cards - show next cards behind current one */}
              {filteredEvents.slice(currentIndex, currentIndex + 3).map((event, stackIndex) => {
                const isCurrentCard = stackIndex === 0;
                const zIndex = 30 - stackIndex;
                const scale = 1 - (stackIndex * 0.05);
                const yOffset = stackIndex * 8;
                
                return (
                  <div
                    key={`${event.id}-${currentIndex + stackIndex}`}
                    className="absolute inset-0"
                    style={{
                      zIndex,
                      transform: `scale(${scale}) translateY(${yOffset}px)`,
                      opacity: isCurrentCard ? 1 : 0.7
                    }}
                  >
                    <WouliEventCard
                      event={event}
                      variant="swipe"
                      isLiked={userInteractions.liked.has(event.id)}
                      isParticipating={userInteractions.participating.has(event.id)}
                      onLike={() => handleLike(event.id)}
                      onDislike={handleDislike}
                      onParticipate={() => handleParticipate(event.id)}
                      onShare={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: event.title,
                            text: `Découvre ${event.title} sur Wouli !`,
                            url: window.location.href
                          });
                        }
                      }}
                      onCardClick={() => handleViewEvent(event.id)}
                      enableSwipe={isCurrentCard}
                      onSwipeLeft={() => setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1))}
                      onSwipeRight={() => handleLike(event.id)}
                      className="w-full h-full"
                    />
                  </div>
                );
              })}
              
              {/* Action buttons overlay - hidden during drag */}
              {currentEvent && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20 pointer-events-none">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/80 backdrop-blur-sm border-2 pointer-events-auto"
                    onClick={handleDislike}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="default"
                    size="icon" 
                    className="rounded-full bg-gradient-primary border-2 border-white pointer-events-auto"
                    onClick={() => handleLike(currentEvent.id)}
                  >
                    <Heart className={`h-5 w-5 ${userInteractions.liked.has(currentEvent.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {filteredEvents.length === 0 && !loading && (
            <EmptyState onReset={clearFilters} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
