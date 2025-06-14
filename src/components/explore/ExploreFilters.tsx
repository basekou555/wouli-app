
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ExploreFiltersProps {
  filter: string;
  onFilterChange: (filterType: string) => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPerformSearch: () => void;
}

const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  filter,
  onFilterChange,
  showSearch,
  onToggleSearch,
  searchTerm,
  onSearchChange,
  onPerformSearch
}) => {
  return (
    <>
      {/* Barre de recherche et filtres */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full"
          onClick={onToggleSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => onFilterChange('all')}
            size="sm"
            className="rounded-full"
          >
            Tous
          </Button>
          <Button 
            variant={filter === 'public' ? 'default' : 'outline'} 
            onClick={() => onFilterChange('public')}
            size="sm"
            className="rounded-full"
          >
            Établissements
          </Button>
          <Button 
            variant={filter === 'friends' ? 'default' : 'outline'} 
            onClick={() => onFilterChange('friends')}
            size="sm"
            className="rounded-full"
          >
            Utilisateurs
          </Button>
        </div>
      </div>
      
      {/* Search drawer (collapsible) */}
      {showSearch && (
        <div className="flex space-x-2 items-center pb-2 pt-1">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un événement ou un lieu"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={onPerformSearch}>Chercher</Button>
        </div>
      )}
    </>
  );
};

export default ExploreFilters;
