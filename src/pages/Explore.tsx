
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

  // Fonctions dédiées pour les swipes - fix du bug de cartes bloquées
  const handleSwipeLeft = () => {
    console.log('👈 Swipe left détecté - prochaine carte');
    setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));
  };

  const handleSwipeRight = async (eventId: string) => {
    console.log('👉 Swipe right détecté - like + prochaine carte');
    
    // Avancer immédiatement l'index pour éviter les cartes bloquées
    setCurrentIndex(prev => Math.min(prev + 1, filteredEvents.length - 1));

    // Mise à jour optimiste de l'UI
    setUserInteractions(prev => ({
      ...prev,
      liked: new Set([...prev.liked, eventId])
    }));

    // Like en arrière-plan avec synchro des compteurs
    const event = filteredEvents.find(e => e.id === eventId);
    await simpleLike(eventId, event?.title);
    await refetch();
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
    <div className="h-screen bg-[#0A0A0B] flex flex-col overflow-hidden">
      {/* Header fixe avec filtres (5% hauteur) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-4 h-16">
          {/* Notifications à gauche */}
          <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
            <div className="relative">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </Button>

          {/* Filtres horizontaux scrollables */}
          <div className="flex-1 flex justify-end">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-64">
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm" 
                className="whitespace-nowrap text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => handleCategoryChange(null)}
              >
                Tout
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {/* Logic for tonight filter */}}
              >
                Ce soir
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {/* Logic for tomorrow filter */}}
              >
                Demain
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="whitespace-nowrap text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {/* Logic for free filter */}}
              >
                Gratuit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone carte immersive (85% hauteur) */}
      <div className="flex-1 flex items-center justify-center px-2 pt-20 pb-28">
        <div className="w-full h-full max-w-md mx-auto relative">
          {currentIndex < filteredEvents.length ? (
            <>
              {/* Carte active */}
              <div className="absolute inset-0 z-10">
                <WouliEventCard
                  event={filteredEvents[currentIndex]}
                  variant="swipe"
                  isLiked={userInteractions.liked.has(filteredEvents[currentIndex].id)}
                  isParticipating={userInteractions.participating.has(filteredEvents[currentIndex].id)}
                  onLike={() => handleLike(filteredEvents[currentIndex].id)}
                  onParticipate={() => handleParticipate(filteredEvents[currentIndex].id)}
                  onDislike={handleDislike}
                  onShare={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: filteredEvents[currentIndex].title,
                        text: `Découvre ${filteredEvents[currentIndex].title} sur Wouli !`,
                        url: window.location.href
                      });
                    }
                  }}
                  onCardClick={() => handleViewEvent(filteredEvents[currentIndex].id)}
                  enableSwipe={true}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={() => handleSwipeRight(filteredEvents[currentIndex].id)}
                  className="w-full h-full"
                />
              </div>
              
              {/* Carte suivante en arrière-plan */}
              {currentIndex + 1 < filteredEvents.length && (
                <div className="absolute inset-0 z-0 transform scale-95 opacity-30 pointer-events-none">
                  <WouliEventCard
                    event={filteredEvents[currentIndex + 1]}
                    variant="swipe"
                    isLiked={userInteractions.liked.has(filteredEvents[currentIndex + 1].id)}
                    isParticipating={userInteractions.participating.has(filteredEvents[currentIndex + 1].id)}
                    onLike={() => {}}
                    onParticipate={() => {}}
                    onDislike={() => {}}
                    onShare={() => {}}
                    onCardClick={() => {}}
                    enableSwipe={false}
                    className="w-full h-full"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-white">
              <p className="text-white/60 mb-4">Plus d'événements à découvrir !</p>
              <Button onClick={clearFilters} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Réinitialiser
              </Button>
            </div>
          )}
          
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-white">
              <p className="text-white/60">Aucun événement trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action fixes (10% hauteur) */}
      {currentIndex < filteredEvents.length && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center space-x-6">
            {/* Dislike */}
            <Button
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
              onClick={handleSwipeLeft}
            >
              <X className="h-6 w-6" />
            </Button>
            
            {/* Save/Star */}
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 text-yellow-400 hover:bg-white/20 backdrop-blur-md"
              onClick={() => {/* Add save logic */}}
            >
              ⭐
            </Button>
            
            {/* Like */}
            <Button
              variant="default"
              size="icon"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-red-500 border-2 border-white/20 text-white hover:from-pink-600 hover:to-red-600 shadow-lg"
              onClick={() => handleSwipeRight(filteredEvents[currentIndex].id)}
            >
              <Heart className={`h-6 w-6 ${userInteractions.liked.has(filteredEvents[currentIndex].id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
