
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
import { getEventInteractionStatus } from '../services/eventInteractionService';

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

  const { incrementViews, likeEvent, participateEvent } = useEventActions(filteredEvents, refetch);
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);

  // Set up real-time updates for event stats
  useRealTimeEvents(filteredEvents, refetch);

  // Load user interaction status for current events
  useEffect(() => {
    const loadInteractionStatus = async () => {
      if (!user || !filteredEvents.length) return;

      const statuses = await Promise.all(
        filteredEvents.map(event => 
          getEventInteractionStatus(event.id, user.id)
        )
      );

      const liked = filteredEvents
        .filter((_, index) => statuses[index]?.hasLiked)
        .map(event => event.id);
      
      const participating = filteredEvents
        .filter((_, index) => statuses[index]?.hasParticipated)
        .map(event => event.id);

      setLikedEvents(liked);
      setParticipatingEvents(participating);
    };

    loadInteractionStatus();
  }, [filteredEvents, user]);

  const handleLike = async (eventId: string) => {
    if (!user) return;
    
    const success = await likeEvent(eventId, user.id);
    if (success) {
      setLikedEvents(prev => [...prev, eventId]);
    }
  };

  const handleParticipate = async (eventId: string) => {
    if (!user) return;
    
    const success = await participateEvent(eventId, user.id);
    if (success) {
      setParticipatingEvents(prev => [...prev, eventId]);
    }
  };

  const handleViewEvent = async (eventId: string) => {
    await incrementViews(eventId, 'user');
  };

  const currentEvent = filteredEvents[currentIndex];

  if (loading) return <AppLayout><div className="p-8 text-center">Chargement...</div></AppLayout>;
  if (error) return <AppLayout><div className="p-8 text-center text-red-500">{error}</div></AppLayout>;

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
              isLiked={likedEvents.includes(currentEvent.id)}
              isParticipating={participatingEvents.includes(currentEvent.id)}
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
