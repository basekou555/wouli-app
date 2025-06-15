
import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '../components/AppLayout';
import SwipeCard from '../components/explore/SwipeCard';
import ExploreHeader from '../components/explore/ExploreHeader';
import ExploreFilters from '../components/explore/ExploreFilters';
import EmptyState from '../components/explore/EmptyState';
import { useSwipeCards } from '../hooks/useSwipeCards';
import { useExploreFilters } from '../hooks/useExploreFilters';
import { useEventActions } from '../hooks/useEventActions';
import { useAuth } from '../contexts/AuthContext';
import { useRealTimeEvents } from '../hooks/useRealTimeEvents';
import { supabase } from '@/integrations/supabase/client';

const Explore = () => {
  const { user } = useAuth();
  const {
    filteredEvents: allEvents,
    loading,
    error,
    currentIndex,
    setCurrentIndex,
    refetch
  } = useSwipeCards();
  
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

  const { likeEvent, participateEvent, incrementViews } = useEventActions(refetch);
  const [userInteractions, setUserInteractions] = useState<{
    liked: Set<string>;
    participating: Set<string>;
  }>({
    liked: new Set(),
    participating: new Set()
  });

  // Set up real-time updates for event stats
  useRealTimeEvents(filteredEvents, refetch);

  // Load user interaction status for current events
  useEffect(() => {
    const loadInteractionStatus = async () => {
      if (!user || !filteredEvents.length) {
        console.log('👤 Pas d\'utilisateur connecté ou pas d\'événements');
        setUserInteractions({ liked: new Set(), participating: new Set() });
        return;
      }

      console.log('🔄 Chargement du statut d\'interaction pour', filteredEvents.length, 'événements');

      try {
        const eventIds = filteredEvents.map(event => event.id);

        // Récupérer les likes de l'utilisateur pour ces événements
        const { data: likesData, error: likesError } = await supabase
          .from('event_likes')
          .select('event_id')
          .eq('user_id', user.id)
          .in('event_id', eventIds);

        if (likesError) {
          console.error('❌ Erreur lors de la récupération des likes:', likesError);
        }

        // Récupérer les participations de l'utilisateur pour ces événements
        const { data: participationsData, error: participationsError } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', user.id)
          .in('event_id', eventIds);

        if (participationsError) {
          console.error('❌ Erreur lors de la récupération des participations:', participationsError);
        }

        const liked = new Set(likesData?.map(item => item.event_id) || []);
        const participating = new Set(participationsData?.map(item => item.event_id) || []);

        console.log('📊 Statuts chargés - Likés:', liked.size, 'Participants:', participating.size);
        setUserInteractions({ liked, participating });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des statuts d\'interaction:', error);
        setUserInteractions({ liked: new Set(), participating: new Set() });
      }
    };

    loadInteractionStatus();
  }, [filteredEvents, user]);

  const handleLike = async (eventId: string) => {
    if (!user) {
      console.log('⚠️ Utilisateur non connecté pour le like');
      return;
    }
    
    console.log('❤️ Tentative de like dans Explore pour:', eventId);
    
    const success = await likeEvent(eventId, user.id);
    if (success) {
      console.log('✅ Like réussi, mise à jour de l\'état local');
      setUserInteractions(prev => ({
        ...prev,
        liked: new Set([...prev.liked, eventId])
      }));
    }
  };

  const handleParticipate = async (eventId: string) => {
    if (!user) {
      console.log('⚠️ Utilisateur non connecté pour la participation');
      return;
    }
    
    console.log('🎉 Tentative de participation dans Explore pour:', eventId);
    
    const success = await participateEvent(eventId, user.id);
    if (success) {
      console.log('✅ Participation réussie, mise à jour de l\'état local');
      setUserInteractions(prev => ({
        ...prev,
        participating: new Set([...prev.participating, eventId])
      }));
    }
  };

  const handleViewEvent = async (eventId: string) => {
    console.log('👁️ Vue d\'événement dans Explore pour:', eventId);
    await incrementViews(eventId);
  };

  const currentEvent = filteredEvents[currentIndex];

  if (loading) return <AppLayout><div className="p-8 text-center">Chargement...</div></AppLayout>;
  if (error) return <AppLayout><div className="p-8 text-center text-red-500">{error.message}</div></AppLayout>;

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

        <div className="flex-1 flex items-center justify-center p-4">
          {currentEvent ? (
            <SwipeCard 
              event={currentEvent}
              onLike={() => handleLike(currentEvent.id)}
              onParticipate={() => handleParticipate(currentEvent.id)}
              onNext={() => setCurrentIndex(prev => prev + 1)}
              onView={() => handleViewEvent(currentEvent.id)}
              isLiked={userInteractions.liked.has(currentEvent.id)}
              isParticipating={userInteractions.participating.has(currentEvent.id)}
            />
          ) : (
            <EmptyState onReset={clearFilters} />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
