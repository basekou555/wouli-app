
import { useState, useMemo } from 'react';
import { UnifiedEvent } from '@/types/unified';

export const useExploreFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setShowFilters(false);
  };

  return {
    selectedCategory,
    searchTerm,
    showFilters,
    handleCategoryChange,
    handleSearchChange,
    toggleFilters,
    clearFilters
  };
};
