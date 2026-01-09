import { useState, useMemo } from 'react';
import { UnifiedEvent } from '@/types/unified';

interface UseSearchFiltersOptions {
  initialPrice?: string;
  initialTime?: string;
}

export const useSearchFilters = (allEvents: UnifiedEvent[], options: UseSearchFiltersOptions = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState(options.initialPrice || 'all');
  const [selectedTime, setSelectedTime] = useState(options.initialTime || 'all');

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

    // Filtre par prix
    if (selectedPrice !== 'all') {
      filtered = filtered.filter(event => {
        const priceText = event.price_text || '0';
        const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const isFree = price === 0 || priceText.toLowerCase().includes('gratuit');
        
        switch (selectedPrice) {
          case 'free':
            return isFree;
          case 'cheap':
            return !isFree && price < 15;
          case 'medium':
            return price >= 15 && price <= 30;
          case 'expensive':
            return price > 30;
          default:
            return true;
        }
      });
    }

    // Filtre par temps/horaire
    if (selectedTime !== 'all') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        switch (selectedTime) {
          case 'now':
            // Events in the next 2 hours
            const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
            return eventDate >= now && eventDate <= twoHoursFromNow;
          case 'tonight':
            // Events today
            return eventDate.toDateString() === now.toDateString();
          case 'tomorrow':
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return eventDate.toDateString() === tomorrow.toDateString();
          case 'weekend':
            const dayOfWeek = eventDate.getDay();
            // Friday, Saturday, Sunday
            return dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
          default:
            return true;
        }
      });
    }

    // Filtre par date (legacy, pour compatibilité)
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
          filtered = filtered.filter(event => {
            const eDate = new Date(event.date);
            const day = eDate.getDay();
            return day === 0 || day === 6;
          });
          break;
        case 'week':
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
  }, [allEvents, searchTerm, selectedCategory, selectedDate, selectedPrice, selectedTime]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedDate('all');
    setSelectedPrice('all');
    setSelectedTime('all');
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedCategory !== null || 
    selectedDate !== 'all' || 
    selectedPrice !== 'all' || 
    selectedTime !== 'all';

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedDate,
    setSelectedDate,
    selectedPrice,
    setSelectedPrice,
    selectedTime,
    setSelectedTime,
    filteredEvents,
    clearFilters,
    hasActiveFilters
  };
};
