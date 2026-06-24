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

export const getSocialProofText = (
  friends: { name: string }[] = [],
  totalParticipants: number = 0,
): string => {
  if (friends.length > 0) {
    if (friends.length === 1) {
      return `${friends[0].name} + ${totalParticipants - 1} autres`;
    }
    return `${friends.length} amis + ${totalParticipants - friends.length} autres`;
  } else if (totalParticipants > 0) {
    // §7.2 — preuve sociale forte sur la face avant ("47 personnes y vont").
    return totalParticipants === 1
      ? '1 personne y va'
      : `${totalParticipants} personnes y vont`;
  } else {
    return 'Sois le premier';
  }
};

/**
 * Date chaude (§7.1 du design système carte). Transforme une date froide
 * ("sam 17") en temporalité chaleureuse — cœur de la promesse
 * "qu'est-ce qu'on fait ce soir ?". Retourne le label relatif SANS l'heure
 * (l'heure est affichée séparément dans chaque énergie → on évite le doublon).
 *
 *  - Aujourd'hui (soir ≥18h)  → "Ce soir"
 *  - Aujourd'hui (journée)    → "Aujourd'hui"
 *  - Demain                   → "Demain"
 *  - Cette semaine (J+2..J+6) → "Vendredi"
 *  - Plus loin                → "Sam 17"
 */
export const formatHotDate = (date: string, time?: string): string => {
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return '';

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round(
    (startOfDay(dt).getTime() - startOfDay(new Date()).getTime()) / 86_400_000,
  );

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (dayDiff === 0) {
    const hh = time ? parseInt(time.split(':')[0], 10) : NaN;
    const isEvening = Number.isNaN(hh) || hh >= 18;
    return isEvening ? 'Ce soir' : "Aujourd'hui";
  }
  if (dayDiff === 1) return 'Demain';
  if (dayDiff >= 2 && dayDiff <= 6) {
    return capitalize(dt.toLocaleDateString('fr-FR', { weekday: 'long' }));
  }
  // Plus loin (ou passé) → "Sam 17"
  return capitalize(
    dt
      .toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
      .replace(/\./g, ''),
  );
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