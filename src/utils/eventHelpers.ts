import { UnifiedEvent } from '@/types/unified';

export const formatDateTime = (event: UnifiedEvent): string => {
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
    dateText = date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }
  
  const timeText = event.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  return `${dateText} ${timeText}`;
};

export const getEventStatus = (event: UnifiedEvent): string => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  if (eventDate > now) return 'À venir';
  if (eventDate.toDateString() === now.toDateString()) return 'En cours';
  return 'Terminé';
};

export const getStatusVariant = (event: UnifiedEvent): 'default' | 'secondary' | 'destructive' => {
  const status = getEventStatus(event);
  switch (status) {
    case 'À venir': return 'default';
    case 'En cours': return 'secondary';
    case 'Terminé': return 'destructive';
    default: return 'default';
  }
};

export const getPerformanceBadge = (event: UnifiedEvent): string => {
  if (!event.conversion_rate) return '📊';
  if (event.conversion_rate > 0.3) return '🔥';
  if (event.conversion_rate > 0.2) return '⚡';
  if (event.conversion_rate > 0.1) return '📊';
  return '📉';
};

/**
 * Wouli unified event helpers
 * Replaces individual helper functions with centralized logic
 */

/**
 * Get urgency badge text based on event timing
 */
export const getUrgencyBadge = (eventDate: string | Date, eventTime?: string): string | null => {
  const now = new Date();
  const event = eventTime 
    ? new Date(`${eventDate}${eventTime ? `T${eventTime}` : ''}`)
    : new Date(eventDate);
  const diffHours = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 0) return null; // Event passed
  if (diffHours < 1) return "Maintenant";
  if (diffHours < 4) return "Dans 2h";
  if (diffHours < 24 && now.toDateString() === event.toDateString()) return "Ce soir";
  
  return null;
};

/**
 * Generate social proof text based on friends and participants
 */
export const getSocialText = (
  friendsCount: number, 
  totalParticipants: number, 
  friendsNames?: string[]
): string => {
  if (friendsCount > 0) {
    if (friendsCount === 1 && friendsNames?.[0]) {
      const others = totalParticipants - 1;
      return others > 0 ? `${friendsNames[0]} + ${others} autres` : friendsNames[0];
    }
    const others = totalParticipants - friendsCount;
    return others > 0 
      ? `${friendsCount} amis + ${others} autres` 
      : `${friendsCount} amis`;
  } else if (totalParticipants > 10) {
    return `${totalParticipants} personnes intéressées`;
  } else if (totalParticipants > 0) {
    return `${totalParticipants} ${totalParticipants === 1 ? 'personne' : 'personnes'} intéressées`;
  } else {
    return "Sois le premier de tes amis";
  }
};

/**
 * Check if event is urgent (< 4h)
 */
export const isEventUrgent = (eventDate: string | Date, eventTime?: string): boolean => {
  const now = new Date();
  const event = eventTime 
    ? new Date(`${eventDate}${eventTime ? `T${eventTime}` : ''}`)
    : new Date(eventDate);
  const diffHours = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffHours > 0 && diffHours < 4;
};

/**
 * Format event price display
 */
export const formatEventPrice = (price?: number | string, isFree?: boolean): string => {
  if (isFree || price === 0 || price === '0€') return "Gratuit";
  if (typeof price === 'string') {
    if (price.toLowerCase().includes('gratuit')) return "Gratuit";
    return price;
  }
  if (price) return `${price}€`;
  return "Prix non spécifié";
};

/**
 * Format event date and time display
 */
export const formatEventDateTime = (date: string, time?: string): string => {
  const eventDate = new Date(date);
  const now = new Date();
  
  const isToday = eventDate.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();
  
  const timeText = time || eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) return `Aujourd'hui ${timeText}`;
  if (isTomorrow) return `Demain ${timeText}`;
  
  const dayName = eventDate.toLocaleDateString('fr-FR', { weekday: 'long' });
  return `${dayName} ${timeText}`;
};

/**
 * Get location display text
 */
export const getLocationDisplay = (venue?: string, location?: string): string => {
  return venue || location?.split(',')[0].trim() || 'Lieu non spécifié';
};