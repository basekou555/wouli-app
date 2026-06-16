// Helpers réutilisables pour WouliEventCard

export const getUrgencyBadge = (date: string, time?: string): string | null => {
  const now = new Date();
  const eventDateTime = new Date(`${date}${time ? `T${time}` : ''}`);
  const hoursUntil = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Événement passé
  if (hoursUntil < 0) return null;
  
  // Événement imminent
  if (hoursUntil < 2) return "Maintenant";
  if (hoursUntil < 4) return "Dans 2h";
  
  // Événement le même jour
  const isSameDay = now.toDateString() === eventDateTime.toDateString();
  if (isSameDay) return "Ce soir";
  
  return null;
};

export const getSocialProofText = (friends: any[] = [], totalParticipants: number = 0): string => {
  if (friends.length > 0) {
    if (friends.length === 1) {
      return `${friends[0].name} + ${totalParticipants - 1} autres`;
    }
    return `${friends.length} amis + ${totalParticipants - friends.length} autres`;
  } else if (totalParticipants > 0) {
    return `${totalParticipants} personnes intéressées`;
  } else {
    return "Sois le premier";
  }
};

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

export const getPriceDisplay = (priceText?: string): string => {
  if (!priceText) return 'Gratuit';
  if (priceText.toLowerCase().includes('gratuit') || priceText === '0€') return 'Gratuit';
  return priceText;
};

export const getPriceInfo = (priceText?: string): { display: string; isFree: boolean } => {
  if (!priceText) return { display: 'Gratuit', isFree: true };
  if (priceText.toLowerCase().includes('gratuit') || priceText === '0€') return { display: 'Gratuit', isFree: true };
  // Ajoute le symbole "€" si le prix est numérique mais sans devise (ex: "30" → "30€").
  let display = priceText.trim();
  if (/\d/.test(display) && !/[€$£]/.test(display) && !/eur/i.test(display)) {
    display = `${display}€`;
  }
  return { display, isFree: false };
};

export const getLocationDisplay = (venue?: string, location?: string): string => {
  return venue || location?.split(',')[0].trim() || 'Lieu non spécifié';
};