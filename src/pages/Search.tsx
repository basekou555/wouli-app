
import React, { useState } from 'react';
import { useAllEvents } from '@/hooks/useAllEvents';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useEventInteractions } from '@/hooks/useEventInteractions';
import BottomNavigation from '../components/BottomNavigation';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import SearchHeader from '@/components/search/SearchHeader';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResults from '@/components/search/SearchResults';

const Search = () => {
  const [showFilters, setShowFilters] = useState(false);
  const { events: allEvents, loading } = useAllEvents();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDate,
    setSelectedDate,
    filteredEvents,
    clearFilters
  } = useSearchFilters(allEvents);

  const {
    likedEvents,
    participatingEvents,
    handleLike,
    handleParticipate
  } = useEventInteractions(allEvents);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {showFilters && (
        <div className="bg-white shadow-sm p-4">
          <SearchFilters
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onClearFilters={clearFilters}
          />
        </div>
      )}

      <SearchResults
        events={filteredEvents}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedDate={selectedDate}
        likedEvents={likedEvents}
        participatingEvents={participatingEvents}
        onLike={handleLike}
        onParticipate={handleParticipate}
        onClearFilters={clearFilters}
      />

      <BottomNavigation />
    </div>
  );
};

export default Search;
