
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Types for categories and subcategories
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

// Liste complète des catégories et sous-catégories
const categories: Category[] = [
  {
    id: 'sorties',
    name: 'Sorties & Loisirs',
    emoji: '🎭',
    subCategories: [
      { id: 'cinema', name: 'Cinéma & Spectacle', emoji: '🎬' },
      { id: 'jeux', name: 'Jeux & Expériences', emoji: '🎮' },
      { id: 'parcs', name: 'Parcs & Attractions', emoji: '🎡' },
      { id: 'sport', name: 'Activités Sportives', emoji: '⚽' },
      { id: 'bars', name: 'Bars & Afterworks', emoji: '🎯' },
      { id: 'perso-sorties', name: 'Événements Personnalisés', emoji: '➕' },
    ]
  },
  {
    id: 'food',
    name: 'Food & Chill',
    emoji: '🍽️',
    subCategories: [
      { id: 'restaurant', name: 'Restaurant', emoji: '🍕' },
      { id: 'cafe', name: 'Café & Détente', emoji: '☕' },
      { id: 'maison', name: 'Soirée à la Maison', emoji: '🍱' },
      { id: 'picnic', name: 'Pique-Nique & Balade', emoji: '🌿' },
      { id: 'tasting', name: 'Tasting & Expérience', emoji: '🍻' },
      { id: 'perso-food', name: 'Événements Personnalisés', emoji: '➕' },
    ]
  },
  {
    id: 'culture',
    name: 'Culture & Inspiration',
    emoji: '🎨',
    subCategories: [
      { id: 'musee', name: 'Musée & Expo', emoji: '🏛️' },
      { id: 'conference', name: 'Conférences & Talks', emoji: '📖' },
      { id: 'ateliers', name: 'Ateliers Créatifs', emoji: '🎭' },
      { id: 'concerts', name: 'Concerts & Festivals', emoji: '🎼' },
      { id: 'communaute', name: 'Événements Communautaires', emoji: '🕌' },
      { id: 'perso-culture', name: 'Événements Personnalisés', emoji: '➕' },
    ]
  },
  {
    id: 'voyages',
    name: 'Voyages & Évasions',
    emoji: '🌍',
    subCategories: [
      { id: 'roadtrip', name: 'Road Trip & Excursion', emoji: '🚗' },
      { id: 'camping', name: 'Camping & Nature', emoji: '🏕️' },
      { id: 'plage', name: 'Plage & Détente', emoji: '🏖️' },
      { id: 'montagne', name: 'Montagne & Ski', emoji: '🏔️' },
      { id: 'international', name: 'Voyage International', emoji: '✈️' },
      { id: 'perso-voyages', name: 'Événements Personnalisés', emoji: '➕' },
    ]
  },
  {
    id: 'business',
    name: 'Business & Développement',
    emoji: '💼',
    subCategories: [
      { id: 'networking', name: 'Networking & Meet-ups', emoji: '🤝' },
      { id: 'coworking', name: 'Coworking & Travail', emoji: '🧑‍💻' },
      { id: 'formation', name: 'Formation & Éducation', emoji: '🏫' },
      { id: 'startups', name: 'Startups & Innovation', emoji: '🚀' },
      { id: 'investissement', name: 'Investissement & Finance', emoji: '📊' },
      { id: 'perso-business', name: 'Événements Personnalisés', emoji: '➕' },
    ]
  },
  {
    id: 'perso',
    name: 'Événements Personnels',
    emoji: '🎉',
    subCategories: [
      { id: 'anniversaires', name: 'Anniversaires & Célébrations', emoji: '🎂' },
      { id: 'famille', name: 'Réunions Familiales', emoji: '🎁' },
      { id: 'surprise', name: 'Surprise & Événement Mystère', emoji: '🎈' },
      { id: 'rencontres', name: 'Rencontres & Dates', emoji: '💌' },
      { id: 'perso-events', name: 'Événements Personnalisés', emoji: '➕' },
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
  
  const handleCategoryClick = (category: Category) => {
    setCurrentCategory(category);
    onCategorySelect(category.id);
    setActiveView('subcategories');
    // Reset subcategory when changing category
    onSubCategorySelect(null);
  };
  
  const handleSubCategoryClick = (subCategory: SubCategory) => {
    onSubCategorySelect(subCategory.id);
  };
  
  const handleBackToCategories = () => {
    setActiveView('categories');
  };
  
  // Animation variants
  const containerVariants = {
    categories: { x: 0 },
    subcategories: { x: '-100%' }
  };
  
  return (
    <div className="overflow-hidden relative">
      <motion.div 
        className="flex w-[200%]"
        animate={activeView}
        variants={containerVariants}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* Vue principale des catégories */}
        <div className="w-1/2 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer
                  border-2 transition-all hover:border-wouli-blue hover:shadow-md
                  ${selectedCategory === category.id ? 'border-wouli-blue bg-blue-50' : 'border-gray-200'}
                `}
              >
                <span className="text-4xl mb-2">{category.emoji}</span>
                <span className="text-center font-medium">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Vue des sous-catégories */}
        <div className="w-1/2 flex-shrink-0">
          {currentCategory && (
            <>
              <button 
                onClick={handleBackToCategories}
                className="mb-4 text-sm flex items-center text-gray-600 hover:text-wouli-blue transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Retour aux catégories
              </button>
              
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="mr-2">{currentCategory.emoji}</span>
                {currentCategory.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {currentCategory.subCategories.map((subCategory) => (
                  <div
                    key={subCategory.id}
                    onClick={() => handleSubCategoryClick(subCategory)}
                    className={`
                      flex items-center p-3 rounded-lg cursor-pointer
                      border transition-all
                      ${selectedSubCategory === subCategory.id ? 'border-wouli-blue bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <span className="text-2xl mr-3">{subCategory.emoji}</span>
                    <span className="text-sm">{subCategory.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CategorySelector;
