
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';

// Types pour les nouvelles catégories optimisées
type SubCategory = {
  id: string;
  name: string;
  emoji: string;
};

type Category = {
  id: string;
  name: string;
  emoji: string;
  subCategories: SubCategory[];
};

interface CategorySelectorProps {
  onCategorySelect: (category: string | null) => void;
  onSubCategorySelect: (subCategory: string | null) => void;
  selectedCategory: string | null;
  selectedSubCategory: string | null;
}

// Liste optimisée des catégories et sous-catégories
const categories: Category[] = [
  {
    id: 'culture-spectacle',
    name: 'Culture & Spectacle',
    emoji: '🎬',
    subCategories: [
      { id: 'cinema', name: 'Cinéma', emoji: '🎬' },
      { id: 'theatre', name: 'Théâtre', emoji: '🎭' },
      { id: 'concerts', name: 'Concerts', emoji: '🎵' },
      { id: 'festivals', name: 'Festivals', emoji: '🎪' },
      { id: 'expositions', name: 'Expositions', emoji: '🖼️' },
    ]
  },
  {
    id: 'jeux-activites',
    name: 'Jeux & Activités Ludiques',
    emoji: '🎮',
    subCategories: [
      { id: 'escape-game', name: 'Escape Game', emoji: '🔐' },
      { id: 'vr', name: 'Réalité Virtuelle', emoji: '🥽' },
      { id: 'jeux-societe', name: 'Jeux de Société', emoji: '🎲' },
      { id: 'bowling', name: 'Bowling', emoji: '🎳' },
      { id: 'laser-game', name: 'Laser Game', emoji: '🔫' },
    ]
  },
  {
    id: 'sport-aventure',
    name: 'Sport & Aventure',
    emoji: '⚽',
    subCategories: [
      { id: 'karting', name: 'Karting', emoji: '🏎️' },
      { id: 'escalade', name: 'Escalade', emoji: '🧗' },
      { id: 'randonnee', name: 'Randonnée', emoji: '🥾' },
      { id: 'bivouac', name: 'Bivouac', emoji: '🏕️' },
      { id: 'ski', name: 'Ski', emoji: '🎿' },
    ]
  },
  {
    id: 'food-tasting',
    name: 'Food & Tasting',
    emoji: '🍽️',
    subCategories: [
      { id: 'restaurants', name: 'Restaurants', emoji: '🍕' },
      { id: 'brunchs', name: 'Brunchs', emoji: '🥞' },
      { id: 'aperos', name: 'Apéros', emoji: '🥂' },
      { id: 'degustations', name: 'Dégustations', emoji: '🍷' },
      { id: 'food-trucks', name: 'Food Trucks', emoji: '🚚' },
    ]
  },
  {
    id: 'bars-soirees',
    name: 'Bars & Soirées',
    emoji: '🍸',
    subCategories: [
      { id: 'bars-theme', name: 'Bars à Thème', emoji: '🍻' },
      { id: 'rooftops', name: 'Rooftops', emoji: '🏙️' },
      { id: 'afterworks', name: 'Afterworks', emoji: '🥃' },
      { id: 'boites-nuit', name: 'Boîtes de Nuit', emoji: '💃' },
      { id: 'cocktails', name: 'Cocktails', emoji: '🍹' },
    ]
  },
  {
    id: 'chill-detente',
    name: 'Chill & Détente',
    emoji: '☕',
    subCategories: [
      { id: 'cafes', name: 'Cafés', emoji: '☕' },
      { id: 'coworking', name: 'Coworking', emoji: '💻' },
      { id: 'pique-nique', name: 'Pique-nique', emoji: '🧺' },
      { id: 'balades', name: 'Balades', emoji: '🚶' },
      { id: 'salons-the', name: 'Salons de Thé', emoji: '🍵' },
    ]
  },
  {
    id: 'apprentissage-inspiration',
    name: 'Apprentissage & Inspiration',
    emoji: '🧠',
    subCategories: [
      { id: 'talks', name: 'Talks', emoji: '🎤' },
      { id: 'masterclass', name: 'Masterclass', emoji: '🎓' },
      { id: 'formations', name: 'Formations', emoji: '📚' },
      { id: 'ateliers-creatifs', name: 'Ateliers Créatifs', emoji: '🎨' },
      { id: 'tedx', name: 'TEDx', emoji: '💡' },
    ]
  },
  {
    id: 'voyages-escapades',
    name: 'Voyages & Escapades',
    emoji: '🌍',
    subCategories: [
      { id: 'road-trip', name: 'Road Trip', emoji: '🚗' },
      { id: 'week-end', name: 'Week-end', emoji: '🏖️' },
      { id: 'plage', name: 'Plage', emoji: '🏄' },
      { id: 'montagne', name: 'Montagne', emoji: '🏔️' },
      { id: 'international', name: 'International', emoji: '✈️' },
    ]
  },
  {
    id: 'reseautage-business',
    name: 'Réseautage & Business',
    emoji: '💼',
    subCategories: [
      { id: 'networking', name: 'Networking', emoji: '🤝' },
      { id: 'hackathons', name: 'Hackathons', emoji: '💻' },
      { id: 'incubateurs', name: 'Incubateurs', emoji: '🚀' },
      { id: 'innovation', name: 'Innovation', emoji: '💡' },
      { id: 'finance', name: 'Finance', emoji: '📊' },
    ]
  },
  {
    id: 'evenements-prives',
    name: 'Événements Privés',
    emoji: '🎉',
    subCategories: [
      { id: 'anniversaires', name: 'Anniversaires', emoji: '🎂' },
      { id: 'dates', name: 'Dates', emoji: '💕' },
      { id: 'celebrations', name: 'Célébrations', emoji: '🎊' },
      { id: 'personnalises', name: 'Personnalisés', emoji: '✨' },
    ]
  },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onCategorySelect, 
  onSubCategorySelect,
  selectedCategory,
  selectedSubCategory
}) => {
  const [activeView, setActiveView] = useState<'categories' | 'subcategories'>('categories');
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const isMobile = useIsMobile();
  
  const handleCategoryClick = (category: Category) => {
    setCurrentCategory(category);
    onCategorySelect(category.id);
    setActiveView('subcategories');
    onSubCategorySelect(null);
  };
  
  const handleSubCategoryClick = (subCategory: SubCategory) => {
    onSubCategorySelect(subCategory.id);
  };
  
  const handleBackToCategories = () => {
    setActiveView('categories');
  };
  
  React.useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      if (category) {
        setCurrentCategory(category);
        if (activeView === 'categories') {
          setActiveView('subcategories');
        }
      }
    }
  }, [selectedCategory]);
  
  return (
    <div className="w-full">
      {activeView === 'categories' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer
                transition-all duration-200
                ${selectedCategory === category.id 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md' 
                  : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm'}
                ${isMobile ? 'h-24' : ''}
              `}
            >
              <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} mb-1`}>{category.emoji}</span>
              <span className={`text-center font-medium ${isMobile ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                {category.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-1">
          {currentCategory && (
            <>
              <button 
                onClick={handleBackToCategories}
                className="mb-3 text-sm flex items-center text-gray-600 hover:text-purple-500 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Retour aux catégories
              </button>
              
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <span className="mr-2">{currentCategory.emoji}</span>
                {currentCategory.name}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentCategory.subCategories.map((subCategory) => (
                  <div
                    key={subCategory.id}
                    onClick={() => handleSubCategoryClick(subCategory)}
                    className={`
                      flex items-center p-3 rounded-lg cursor-pointer
                      transition-all duration-200
                      ${selectedSubCategory === subCategory.id 
                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-300' 
                        : 'bg-white border-gray-200 hover:border-gray-300'}
                      border
                    `}
                  >
                    <span className="text-2xl mr-3 flex-shrink-0">{subCategory.emoji}</span>
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} line-clamp-2`}>{subCategory.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
