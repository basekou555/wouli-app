import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Re-export cn from lib/utils for consistency
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retourne le badge d'urgence basé sur l'heure de l'événement
 * @param eventDate - Date de l'événement
 * @returns Texte du badge d'urgence
 */
export const getUrgencyBadge = (eventDate: string | Date): string | null => {
  const now = new Date();
  const event = new Date(eventDate);
  const diffHours = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffHours < 0) return null; // Événement passé
  if (diffHours < 2) return "Maintenant";
  if (diffHours < 4) return "Dans 2h";
  if (diffHours < 24 && now.toDateString() === event.toDateString()) return "Ce soir";
  
  return null;
};

/**
 * Génère le texte de social proof basé sur les amis et participants
 * @param friendsCount - Nombre d'amis participants
 * @param totalParticipants - Nombre total de participants
 * @param friendsNames - Noms des amis (optionnel)
 * @returns Texte de social proof
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
 * Détermine si un événement est urgent (< 4h)
 * @param eventDate - Date de l'événement
 * @returns true si urgent
 */
export const isEventUrgent = (eventDate: string | Date): boolean => {
  const now = new Date();
  const event = new Date(eventDate);
  const diffHours = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return diffHours > 0 && diffHours < 4;
};

/**
 * Formate le prix de l'événement
 * @param price - Prix en euros
 * @param isFree - Si l'événement est gratuit
 * @returns Texte formaté du prix
 */
export const formatEventPrice = (price?: number, isFree?: boolean): string => {
  if (isFree || price === 0) return "Gratuit";
  if (price) return `${price}€`;
  return "Prix non spécifié";
};