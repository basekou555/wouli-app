
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';

interface ExploreHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
}

const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onToggleFilters,
  onClearFilters
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Découvrir</h1>
        <p className="text-gray-500">Trouvez de nouvelles activités qui pourraient vous plaire</p>
      </div>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" onClick={onToggleFilters}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ExploreHeader;
