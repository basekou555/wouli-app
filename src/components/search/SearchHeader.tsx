
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Filter } from 'lucide-react';

interface SearchHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters
}) => {
  return (
    <div className="bg-white shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rechercher</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un événement, lieu, organisateur..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export default SearchHeader;
