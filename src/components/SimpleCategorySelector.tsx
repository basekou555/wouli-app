
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { WOULI_CATEGORIES, WouliCategory } from '@/data/wouliCategories';

interface SimpleCategorySelectorProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  showAllOption?: boolean;
}

const SimpleCategorySelector: React.FC<SimpleCategorySelectorProps> = ({
  selectedCategory,
  onCategorySelect,
  showAllOption = true
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {showAllOption && (
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => onCategorySelect(null)}
        >
          🌟 Toutes
        </Badge>
      )}
      
      {WOULI_CATEGORIES.map((category: WouliCategory) => (
        <Badge
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          className="cursor-pointer hover:bg-purple-100"
          onClick={() => onCategorySelect(category.id)}
          style={{
            backgroundColor: selectedCategory === category.id ? category.color : undefined,
            borderColor: category.color
          }}
        >
          {category.icon} {category.name}
        </Badge>
      ))}
    </div>
  );
};

export default SimpleCategorySelector;
