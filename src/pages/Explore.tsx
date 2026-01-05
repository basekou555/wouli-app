import React, { useState, useRef, useCallback, useEffect } from 'react';
import { usePaginatedEvents } from '@/hooks/usePaginatedEvents';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useEventInteractions } from '@/hooks/useEventInteractions';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import SearchResults from '@/components/search/SearchResults';
import MenuDrawer from '@/components/MenuDrawer';
import FiltersDrawer from '@/components/FiltersDrawer';
import { Input } from '@/components/ui/input';
import { Menu, Search as SearchIcon, SlidersHorizontal, Loader2 } from 'lucide-react';

const Explore = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedTime, setSelectedTime] = useState('all');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { 
    events: allEvents, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore,
    totalCount 
  } = usePaginatedEvents();
  
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

  // Infinite scroll detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // Load more when user is 200px from the bottom
      if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !loadingMore) {
        loadMore();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loadingMore, loadMore]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'all' ? null : category);
  };

  const handleResetFilters = () => {
    clearFilters();
    setSelectedPrice('all');
    setSelectedTime('all');
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header style App avec recherche */}
      <header className="flex-shrink-0 bg-card border-b border-border sticky top-0 z-40">
        {/* Ligne 1 : Menu + WOULI + Filtres */}
        <div className="h-14 px-4 flex items-center justify-between">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          
          <span className="font-bold text-lg tracking-wide text-foreground">WOULI</span>
          
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>
        </div>
        
        {/* Ligne 2 : Barre de recherche */}
        <div className="px-4 pb-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full bg-accent/50 border-border"
            />
          </div>
        </div>
      </header>

      {/* Résultats scrollables avec infinite scroll */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <SearchResults
          events={filteredEvents}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedDate={selectedDate}
          likedEvents={likedEvents}
          participatingEvents={participatingEvents}
          onLike={handleLike}
          onParticipate={handleParticipate}
          onClearFilters={handleResetFilters}
          totalActiveCount={totalCount}
        />
        
        {/* Loading indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground text-sm">Chargement...</span>
          </div>
        )}
        
        {/* End of list indicator */}
        {!hasMore && filteredEvents.length > 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Tous les événements ont été chargés
          </div>
        )}
      </div>

      {/* Drawers */}
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
    </div>
  );
};

export default Explore;
