
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import SimpleCategorySelector from '@/components/SimpleCategorySelector';

interface SearchFiltersProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  selectedCategory,
  onCategorySelect,
  selectedDate,
  onDateSelect,
  onClearFilters
}) => {
  const dateFilters = [
    { id: 'all', name: 'Toutes les dates' },
    { id: 'today', name: 'Aujourd\'hui' },
    { id: 'weekend', name: 'Ce weekend' },
    { id: 'week', name: 'Cette semaine' },
    { id: 'month', name: 'Ce mois' }
  ];

  return (
    <div className="space-y-3 pt-2 border-t">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Catégorie</p>
        <SimpleCategorySelector
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          showAllOption={true}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Date</p>
        <div className="flex gap-2 flex-wrap">
          {dateFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={selectedDate === filter.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onDateSelect(filter.id)}
            >
              {filter.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">📍 Lyon, France (fixe)</p>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Effacer les filtres
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;
