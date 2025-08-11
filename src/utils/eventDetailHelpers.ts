import { UnifiedEvent } from '@/types/unified';

export const formatEventDateTime = (event: UnifiedEvent): string => {
  const date = new Date(event.date);
  const now = new Date();
  
  // Format date relative
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  
  let dateText = '';
  if (isToday) dateText = 'Aujourd\'hui';
  else if (isTomorrow) dateText = 'Demain';
  else {
    dateText = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  
  const timeText = event.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  return `${dateText} à ${timeText}`;
};

export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

export const isTomorrow = (dateString: string): boolean => {
  const date = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

export const calculateDistance = (location?: string): string => {
  // Pour le moment, retour d'une valeur fixe
  // À terme, utiliser l'API de géolocalisation
  return '12';
};

export const getTimeUntilEvent = (dateString: string, timeString?: string): {
  hours: number;
  isUrgent: boolean;
} => {
  const eventDate = new Date(dateString);
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    eventDate.setHours(hours, minutes);
  }
  
  const now = new Date();
  const diffMs = eventDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  return {
    hours: diffHours,
    isUrgent: diffHours < 4 && diffHours > 0
  };
};

export const formatPrice = (price?: string | number): string => {
  if (!price) return 'Gratuit';
  if (typeof price === 'number') {
    return price === 0 ? 'Gratuit' : `${price}€`;
  }
  return price;
};