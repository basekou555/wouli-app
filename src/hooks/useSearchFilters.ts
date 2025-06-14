
import { useState, useMemo } from 'react';
import { UnifiedEvent } from '@/types/unified';

export const useSearchFilters = (allEvents: UnifiedEvent[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('all');

  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filtre par date (simplifié pour la démo)
    if (selectedDate !== 'all') {
      const today = new Date();
      
      switch (selectedDate) {
        case 'today':
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            return eDate.toDateString() === today.toDateString();
          });
          break;
        case 'weekend':
          // Logique simplifiée pour le weekend
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            const day = eDate.getDay();
            return day === 0 || day === 6; // Dimanche ou Samedi
          });
          break;
        case 'week':
          // Événements de cette semaine
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return eDate >= weekStart && eDate <= weekEnd;
          });
          break;
      }
    }

    return filtered;
  }, [allEvents, searchTerm, selectedCategory, selectedDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedDate('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDate,
    setSelectedDate,
    filteredEvents,
    clearFilters
  };
};
