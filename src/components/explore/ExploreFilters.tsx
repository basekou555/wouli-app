
import React from 'react';
import { Button } from '@/components/ui/button';
import { WOULI_CATEGORIES } from '@/data/wouliCategories';

interface ExploreFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg border">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Catégories</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="rounded-full"
        >
          Tous
        </Button>
        {WOULI_CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category.id)}
            className="rounded-full"
          >
            {category.icon} {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ExploreFilters;
