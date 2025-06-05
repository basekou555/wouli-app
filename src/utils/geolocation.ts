
// Fonction pour calculer la distance entre deux points (en km)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
};

// Fonction pour formater l'affichage de la distance
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

// Coordonnées par défaut pour les événements (Paris)
export const getDefaultCoordinates = (venue: string) => {
  // Base de données simple de lieux avec coordonnées
  const locations: Record<string, {lat: number, lon: number}> = {
    'paris': { lat: 48.8566, lon: 2.3522 },
    'lyon': { lat: 45.7640, lon: 4.8357 },
    'marseille': { lat: 43.2965, lon: 5.3698 },
    'bordeaux': { lat: 44.8378, lon: -0.5792 },
    'toulouse': { lat: 43.6047, lon: 1.4442 },
    'nantes': { lat: 47.2184, lon: -1.5536 },
    'strasbourg': { lat: 48.5734, lon: 7.7521 },
    'montpellier': { lat: 43.6110, lon: 3.8767 },
    'lille': { lat: 50.6292, lon: 3.0573 },
    'rennes': { lat: 48.1173, lon: -1.6778 }
  };

  // Chercher dans le nom du lieu
  const venueLower = venue.toLowerCase();
  for (const [city, coords] of Object.entries(locations)) {
    if (venueLower.includes(city)) {
      return coords;
    }
  }

  // Par défaut : Paris
  return locations.paris;
};
