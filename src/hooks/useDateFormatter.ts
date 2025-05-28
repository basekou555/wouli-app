
import { useCallback } from 'react';

export const useDateFormatter = () => {
  // Format date safely with proper error handling
  const formatEventDate = useCallback((dateValue: any): string => {
    if (!dateValue) return 'Date non spécifiée';
    
    try {
      let date;
      
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        // Firestore Timestamp
        date = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        // JavaScript Date object
        date = dateValue;
      } else {
        // Try to parse from other formats
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date invalide';
    }
  }, []);

  // Check if event is upcoming
  const isUpcomingEvent = useCallback((dateValue: any): boolean => {
    try {
      let date;
      
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date(dateValue);
      }
      
      return date > new Date();
    } catch {
      return false;
    }
  }, []);

  return {
    formatEventDate,
    isUpcomingEvent
  };
};
