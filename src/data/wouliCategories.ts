
export interface WouliCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const WOULI_CATEGORIES: WouliCategory[] = [
  {
    id: 'a-boire',
    name: 'À boire',
    icon: '🍸',
    description: 'Bars, rooftops, salons de thé, pubs',
    color: '#3B82F6'
  },
  {
    id: 'a-manger',
    name: 'À manger',
    icon: '🍽️',
    description: 'Restaurants, brunch, street food, food trucks',
    color: '#10B981'
  },
  {
    id: 'soirees',
    name: 'Soirées',
    icon: '🎉',
    description: 'Clubs, DJ sets, soirées étudiantes, concerts',
    color: '#8B5CF6'
  },
  {
    id: 'activites',
    name: 'Activités',
    icon: '🎯',
    description: 'Musées, escape games, ciné, ateliers, sport',
    color: '#F59E0B'
  }
];

export const getCategoryById = (id: string): WouliCategory | undefined => {
  return WOULI_CATEGORIES.find(cat => cat.id === id);
};

export const getCategoryName = (id: string): string => {
  const category = getCategoryById(id);
  return category ? category.name : id;
};

export const getCategoryIcon = (id: string): string => {
  const category = getCategoryById(id);
  return category ? category.icon : '🎯';
};

// Catégorie suivante pour le bouton d'action rapide « Catégorie » (raccourci C).
// Cycle dans l'ordre de WOULI_CATEGORIES ; repart au début si l'id courant est inconnu.
export const getNextCategoryId = (currentId?: string | null): string => {
  const idx = WOULI_CATEGORIES.findIndex(cat => cat.id === currentId);
  return WOULI_CATEGORIES[(idx + 1) % WOULI_CATEGORIES.length].id;
};
