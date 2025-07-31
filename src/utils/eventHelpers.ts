import { Event } from '@/types/event';

export const formatDateTime = (event: Event): string => {
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

export const getEventStatus = (event: Event): string => {
  const now = new Date();
  const eventDate = new Date(event.date);
  
  if (eventDate > now) return 'À venir';
  if (eventDate.toDateString() === now.toDateString()) return 'En cours';
  return 'Terminé';
};

export const getStatusVariant = (event: Event): 'default' | 'secondary' | 'destructive' => {
  const status = getEventStatus(event);
  switch (status) {
    case 'À venir': return 'default';
    case 'En cours': return 'secondary';
    case 'Terminé': return 'destructive';
    default: return 'default';
  }
};

export const getPerformanceBadge = (event: Event): string => {
  if (!event.conversion_rate) return '📊';
  if (event.conversion_rate > 0.3) return '🔥';
  if (event.conversion_rate > 0.2) return '⚡';
  if (event.conversion_rate > 0.1) return '📊';
  return '📉';
};