// Keywords pour l'onboarding Wouli - Lyon focused
export interface OnboardingKeyword {
  id: string;
  label: string;
  emoji: string;
  category: 'a-boire' | 'a-manger' | 'soirees' | 'activites';
  gradient: string;
}

export const ONBOARDING_KEYWORDS: OnboardingKeyword[] = [
  // À boire (5)
  { 
    id: 'afterwork', 
    label: 'Afterwork', 
    emoji: '🍻', 
    category: 'a-boire',
    gradient: 'from-amber-400 to-orange-500'
  },
  { 
    id: 'cocktails', 
    label: 'Cocktails', 
    emoji: '🍸', 
    category: 'a-boire',
    gradient: 'from-pink-400 to-rose-500'
  },
  { 
    id: 'rooftop', 
    label: 'Rooftop', 
    emoji: '🌆', 
    category: 'a-boire',
    gradient: 'from-violet-400 to-purple-600'
  },
  { 
    id: 'degustations', 
    label: 'Dégustations', 
    emoji: '🍷', 
    category: 'a-boire',
    gradient: 'from-red-400 to-rose-600'
  },
  { 
    id: 'bars', 
    label: 'Bars', 
    emoji: '🥂', 
    category: 'a-boire',
    gradient: 'from-yellow-400 to-amber-500'
  },
  
  // Soirées (5)
  { 
    id: 'electro', 
    label: 'Électro', 
    emoji: '🎧', 
    category: 'soirees',
    gradient: 'from-cyan-400 to-blue-600'
  },
  { 
    id: 'concerts', 
    label: 'Concerts', 
    emoji: '🎤', 
    category: 'soirees',
    gradient: 'from-fuchsia-400 to-pink-600'
  },
  { 
    id: 'dj-set', 
    label: 'DJ Set', 
    emoji: '💿', 
    category: 'soirees',
    gradient: 'from-purple-400 to-indigo-600'
  },
  { 
    id: 'clubbing', 
    label: 'Clubbing', 
    emoji: '🪩', 
    category: 'soirees',
    gradient: 'from-indigo-400 to-violet-600'
  },
  { 
    id: 'nocturne', 
    label: 'Nocturne', 
    emoji: '🌙', 
    category: 'soirees',
    gradient: 'from-slate-600 to-gray-800'
  },
  
  // À manger (4)
  { 
    id: 'brunch', 
    label: 'Brunch', 
    emoji: '🥐', 
    category: 'a-manger',
    gradient: 'from-orange-300 to-yellow-400'
  },
  { 
    id: 'street-food', 
    label: 'Street Food', 
    emoji: '🌮', 
    category: 'a-manger',
    gradient: 'from-green-400 to-emerald-500'
  },
  { 
    id: 'gastro', 
    label: 'Gastro', 
    emoji: '🍽️', 
    category: 'a-manger',
    gradient: 'from-amber-500 to-yellow-600'
  },
  { 
    id: 'terrasse', 
    label: 'Terrasse', 
    emoji: '☀️', 
    category: 'a-manger',
    gradient: 'from-sky-400 to-blue-500'
  },
  
  // Activités (5)
  { 
    id: 'gaming', 
    label: 'Gaming', 
    emoji: '🎮', 
    category: 'activites',
    gradient: 'from-green-500 to-teal-600'
  },
  { 
    id: 'escape-game', 
    label: 'Escape Game', 
    emoji: '🔐', 
    category: 'activites',
    gradient: 'from-slate-500 to-zinc-700'
  },
  { 
    id: 'sport', 
    label: 'Sport', 
    emoji: '⚽', 
    category: 'activites',
    gradient: 'from-lime-400 to-green-500'
  },
  { 
    id: 'culture', 
    label: 'Culture', 
    emoji: '🎭', 
    category: 'activites',
    gradient: 'from-rose-400 to-red-500'
  },
  { 
    id: 'creatif', 
    label: 'Créatif', 
    emoji: '🎨', 
    category: 'activites',
    gradient: 'from-teal-400 to-cyan-500'
  },
];

// Minimum keywords required for onboarding
export const MIN_KEYWORDS_REQUIRED = 5;

// Get keywords by category
export const getKeywordsByCategory = (category: OnboardingKeyword['category']) => 
  ONBOARDING_KEYWORDS.filter(k => k.category === category);

// Category labels for display
export const CATEGORY_LABELS: Record<OnboardingKeyword['category'], string> = {
  'a-boire': '🍻 À boire',
  'a-manger': '🍽️ À manger',
  'soirees': '🎉 Soirées',
  'activites': '🎯 Activités'
};
