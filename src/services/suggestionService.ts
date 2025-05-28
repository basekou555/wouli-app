
import { EventType } from "@/types/eventTemplate";
import { User } from "@/hooks/useData";
import { toast } from "@/hooks/use-toast";
import { addDays, addHours, format, isAfter, parse, startOfToday } from "date-fns";
import { fr } from "date-fns/locale";

export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  rating?: number;
  type: EventType;
}

export interface TimeSuggestion {
  date: Date;
  time: string;
  label: string;
}

export interface SuggestionCacheKey {
  type: EventType;
  location?: string;
  userId?: string;
}

// This would normally be stored in localStorage, IndexedDB or similar
const suggestionCache = new Map<string, any>();

const getCacheKey = (key: SuggestionCacheKey): string => {
  return `${key.type}_${key.location || ''}_${key.userId || ''}`;
};

const getFromCache = <T>(key: SuggestionCacheKey): T | null => {
  const cacheKey = getCacheKey(key);
  const cachedData = suggestionCache.get(cacheKey);
  
  if (!cachedData) return null;
  
  // Check if cache is expired (24 hours)
  const now = new Date();
  if (isAfter(now, addHours(cachedData.timestamp, 24))) {
    suggestionCache.delete(cacheKey);
    return null;
  }
  
  return cachedData.data;
};

const saveToCache = <T>(key: SuggestionCacheKey, data: T): void => {
  const cacheKey = getCacheKey(key);
  suggestionCache.set(cacheKey, {
    data,
    timestamp: new Date()
  });
};

// Mock data for place suggestions - This would be replaced with API calls
const mockPlaceSuggestions: Record<EventType, PlaceSuggestion[]> = {
  restaurant: [
    { id: 'r1', name: 'Le Petit Bistro', address: '12 Rue des Beaux Arts, 75006 Paris', rating: 4.5, type: 'restaurant' },
    { id: 'r2', name: 'La Belle Époque', address: '8 Boulevard Saint-Germain, 75005 Paris', rating: 4.7, type: 'restaurant' },
    { id: 'r3', name: 'Chez Marcel', address: '24 Rue Saint-André des Arts, 75006 Paris', rating: 4.3, type: 'restaurant' },
  ],
  cinema: [
    { id: 'c1', name: 'Pathé Bellecour', address: '79 Rue de la République, 69002 Lyon', rating: 4.4, type: 'cinema' },
    { id: 'c2', name: 'UGC Ciné Cité Les Halles', address: '7 Place de la Rotonde, 75001 Paris', rating: 4.2, type: 'cinema' },
    { id: 'c3', name: 'MK2 Bibliothèque', address: '128-162 Avenue de France, 75013 Paris', rating: 4.3, type: 'cinema' },
  ],
  bar: [
    { id: 'b1', name: 'Le Comptoir Général', address: '80 Quai de Jemmapes, 75010 Paris', rating: 4.6, type: 'bar' },
    { id: 'b2', name: 'La Fine Mousse', address: '6 Avenue Jean Aicard, 75011 Paris', rating: 4.8, type: 'bar' },
    { id: 'b3', name: 'Le Perchoir', address: '14 Rue Crespin du Gast, 75011 Paris', rating: 4.5, type: 'bar' },
  ],
  concert: [
    { id: 'con1', name: 'L\'Olympia', address: '28 Boulevard des Capucines, 75009 Paris', rating: 4.7, type: 'concert' },
    { id: 'con2', name: 'Le Zénith', address: '211 Avenue Jean Jaurès, 75019 Paris', rating: 4.5, type: 'concert' },
    { id: 'con3', name: 'AccorHotels Arena', address: '8 Boulevard de Bercy, 75012 Paris', rating: 4.6, type: 'concert' },
  ],
  sport: [
    { id: 's1', name: 'Parc des Princes', address: '24 Rue du Commandant Guilbaud, 75016 Paris', rating: 4.7, type: 'sport' },
    { id: 's2', name: 'Stade de France', address: '93200 Saint-Denis', rating: 4.8, type: 'sport' },
    { id: 's3', name: 'Urban Soccer', address: '61 Rue des Bergers, 75015 Paris', rating: 4.3, type: 'sport' },
  ],
};

export const suggestionService = {
  // Get place suggestions based on event type and user location
  getPlaceSuggestions: async (type: EventType, location?: string): Promise<PlaceSuggestion[]> => {
    try {
      // Check cache first
      const cachedSuggestions = getFromCache<PlaceSuggestion[]>({ type, location });
      if (cachedSuggestions) {
        return cachedSuggestions;
      }
      
      // In a real app, this would be an API call to Google Places or similar
      // For now, we'll just return our mock data with a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const suggestions = mockPlaceSuggestions[type] || [];
      
      // Save to cache
      saveToCache({ type, location }, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      toast.error('Could not load place suggestions. Please try again.');
      return [];
    }
  },
  
  // Get time suggestions based on event type
  getTimeSuggestions: (type: EventType): TimeSuggestion[] => {
    const today = startOfToday();
    const tomorrow = addDays(today, 1);
    const nextWeek = addDays(today, 7);
    
    // Different default times based on event type
    const getDefaultTimes = (eventType: EventType): string[] => {
      switch (eventType) {
        case 'restaurant':
          return ['12:30', '19:30', '20:30'];
        case 'cinema':
          return ['14:00', '18:30', '21:00'];
        case 'bar':
          return ['18:00', '20:00', '22:00'];
        case 'concert':
          return ['19:00', '20:00', '21:00'];
        case 'sport':
          return ['10:00', '14:00', '18:00'];
        default:
          return ['19:00', '20:00', '21:00'];
      }
    };
    
    const times = getDefaultTimes(type);
    
    const suggestions: TimeSuggestion[] = [
      ...times.map(time => ({
        date: tomorrow,
        time,
        label: `Demain à ${time}`
      })),
      ...times.map(time => ({
        date: nextWeek,
        time,
        label: `Dans une semaine à ${time}`
      }))
    ];
    
    return suggestions;
  },
  
  // Get frequently invited people based on event type and user history
  getFrequentlyInvited: (userId: string, eventType: EventType, allUsers: User[]): User[] => {
    // In a real app, this would be based on user history
    // For now, just return a filtered subset of users
    return allUsers.filter((_user, index) => index < 5);
  },
  
  // Check if a venue is likely available at the given time
  checkAvailability: async (placeId: string, date: Date): Promise<boolean> => {
    // This would be an API call to a reservation system
    // For now, return random availability with 80% chance of being available
    await new Promise(resolve => setTimeout(resolve, 200));
    return Math.random() > 0.2;
  }
};

// Validate an event before creation
export const validateEvent = (event: {
  title?: string;
  description?: string;
  date?: Date | null;
  time?: string;
  location?: string;
  type: EventType;
}): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];
  
  if (!event.title) missingFields.push('title');
  if (!event.date) missingFields.push('date');
  if (!event.time) missingFields.push('time');
  if (!event.location) missingFields.push('location');
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};
