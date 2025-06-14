
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAllEvents } from '@/hooks/useAllEvents';
import { useExploreFilters } from '@/hooks/useExploreFilters';
import { useSwipeCards } from '@/hooks/useSwipeCards';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import ExploreHeader from '@/components/explore/ExploreHeader';
import ExploreFilters from '@/components/explore/ExploreFilters';
import SwipeCard from '@/components/explore/SwipeCard';
import EmptyState from '@/components/explore/EmptyState';

const Explore = () => {
  const [showSearch, setShowSearch] = useState(false);
  
  const { events: allEvents, loading } = useAllEvents();
  const { searchTerm, setSearchTerm, filter, handleFilter, filteredEvents } = useExploreFilters(allEvents);
  const { currentIndex, setCurrentIndex, controls, handleSwipe, handleLike, handlePass, handleSave } = useSwipeCards(filteredEvents);

  const performSearch = () => {
    setCurrentIndex(0);
  };

  const currentEvent = filteredEvents[currentIndex];

  if (loading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        <ExploreHeader />
        
        <ExploreFilters
          filter={filter}
          onFilterChange={handleFilter}
          showSearch={showSearch}
          onToggleSearch={() => setShowSearch(!showSearch)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onPerformSearch={performSearch}
        />
        
        {/* Card swiper */}
        {filteredEvents.length > 0 ? (
          <div className="relative h-[70vh] flex items-center justify-center">
            <SwipeCard
              event={currentEvent}
              controls={controls}
              onSwipe={handleSwipe}
              onPass={handlePass}
              onSave={handleSave}
              onLike={handleLike}
            />
            
            {/* Swipe instructions */}
            <div className="absolute bottom-2 left-0 right-0 text-center text-gray-500 text-sm">
              Swipez à gauche pour passer, à droite pour aimer
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
        
        {/* Card counter */}
        <div className="text-center text-gray-500 text-sm">
          {filteredEvents.length > 0 ? 
            `${currentIndex + 1} / ${filteredEvents.length}` : 
            "0 événements"
          }
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
