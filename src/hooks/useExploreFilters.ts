
import { useState, useMemo } from 'react';
import { UnifiedEvent } from '@/types/unified';

export const useExploreFilters = (allEvents: UnifiedEvent[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'friends'

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = !searchTerm || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // For demo purposes, treat business events as "public" and user events as "friends"
      const matchesFilter = filter === 'all' || 
        (filter === 'public' && event.source === 'business') ||
        (filter === 'friends' && event.source === 'user');
      
      return matchesSearch && matchesFilter;
    });
  }, [allEvents, searchTerm, filter]);

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
  };

  return {
    searchTerm,
    setSearchTerm,
    filter,
    handleFilter,
    filteredEvents
  };
};
