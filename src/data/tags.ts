
// Venue Categories
export const VENUE_CATEGORIES = [
  { value: 'bar', label: 'Bar' },
  { value: 'club', label: 'Club' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'salle-spectacle', label: 'Salle de spectacle' },
  { value: 'activite', label: 'Activité' },
  { value: 'culture', label: 'Culture' },
  { value: 'espace-exterieur', label: 'Espace extérieur' }
];

// Activity Types
export const ACTIVITY_TYPES = [
  { value: 'networking', label: 'Networking' },
  { value: 'jeux-arcade', label: 'Jeux d\'arcade' },
  { value: 'escape-game', label: 'Escape game' },
  { value: 'concert', label: 'Concert' },
  { value: 'dj-set', label: 'DJ Set' },
  { value: 'soiree-dansante', label: 'Soirée dansante' },
  { value: 'exposition', label: 'Exposition' },
  { value: 'atelier', label: 'Atelier' },
  { value: 'tournoi', label: 'Tournoi' },
  { value: 'karaoke', label: 'Karaoké' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'afterwork', label: 'Afterwork' },
  { value: 'projection', label: 'Projection' },
  { value: 'degustation', label: 'Dégustation' },
  { value: 'stand-up', label: 'Stand-up' },
  { value: 'open-mic', label: 'Open Mic' },
  { value: 'speed-dating', label: 'Speed Dating' },
  { value: 'bowling', label: 'Bowling' },
  { value: 'visite-guidee', label: 'Visite guidée' },
  { value: 'cours-danse', label: 'Cours de danse' },
  { value: 'theatre', label: 'Théâtre' }
];

// Music Styles
export const MUSIC_STYLES = [
  { value: 'afro', label: 'Afro' },
  { value: 'techno', label: 'Techno' },
  { value: 'salsa', label: 'Salsa' },
  { value: 'hiphop', label: 'Hip-Hop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'electro', label: 'Electro' },
  { value: 'pop', label: 'Pop' },
  { value: 'rnb', label: 'R&B' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'funk', label: 'Funk' },
  { value: 'soul', label: 'Soul' },
  { value: 'world', label: 'World' },
  { value: 'indie', label: 'Indie' },
  { value: 'metal', label: 'Metal' },
  { value: 'latin', label: 'Latin' },
  { value: 'house', label: 'House' },
  { value: 'disco', label: 'Disco' }
];

// Ambiance Options
export const AMBIANCE_OPTIONS = [
  { value: 'chill', label: 'Chill', color: 'bg-blue-500' },
  { value: 'festif', label: 'Festif', color: 'bg-pink-500' },
  { value: 'culturel', label: 'Culturel', color: 'bg-purple-500' },
  { value: 'sportif', label: 'Sportif', color: 'bg-green-500' },
  { value: 'chic', label: 'Chic', color: 'bg-amber-500' },
  { value: 'casual', label: 'Casual', color: 'bg-slate-500' }
];

// Target Audience Options
export const TARGET_AUDIENCE_OPTIONS = [
  { value: 'etudiant', label: 'Étudiant' },
  { value: 'jeune-actif', label: 'Jeune actif' },
  { value: '30+', label: '30+' },
  { value: 'tech', label: 'Tech' },
  { value: 'creatif', label: 'Créatif' },
  { value: 'gamer', label: 'Gamer' },
  { value: 'famille', label: 'Famille' },
  { value: 'expat', label: 'Expat' },
  { value: 'lgbtq+', label: 'LGBTQ+' },
  { value: 'foodie', label: 'Foodie' },
  { value: 'culture', label: 'Culture' },
  { value: 'sport', label: 'Sport' },
  { value: 'nightlife', label: 'Nightlife' }
];

// Event Format Options
export const EVENT_FORMAT_OPTIONS = [
  { value: 'soiree-libre', label: 'Soirée libre' },
  { value: 'tournoi', label: 'Tournoi' },
  { value: 'atelier', label: 'Atelier' },
  { value: 'performance', label: 'Performance' },
  { value: 'exposition', label: 'Exposition' },
  { value: 'projection', label: 'Projection' },
  { value: 'competition', label: 'Compétition' }
];

// Social Intensity Options
export const SOCIAL_INTENSITY_OPTIONS = [
  { value: 'solo', label: 'Solo', icon: 'User', description: 'Activité individuelle' },
  { value: 'petit-groupe', label: 'Petit groupe', icon: 'Users', description: '2-6 personnes' },
  { value: 'moyen', label: 'Moyen', icon: 'Users', description: '10-30 personnes' },
  { value: 'grand-groupe', label: 'Grand groupe', icon: 'Users', description: '50+ personnes' }
];

// Auto-suggestions based on venue category
export const VENUE_SUGGESTIONS: Record<string, {
  activity_types: string[];
  ambiance: string;
  social_intensity: string;
}> = {
  'bar': {
    activity_types: ['networking', 'afterwork', 'degustation', 'quiz'],
    ambiance: 'chill',
    social_intensity: 'moyen'
  },
  'club': {
    activity_types: ['soiree-dansante', 'dj-set', 'concert'],
    ambiance: 'festif',
    social_intensity: 'grand-groupe'
  },
  'restaurant': {
    activity_types: ['brunch', 'degustation', 'speed-dating'],
    ambiance: 'chic',
    social_intensity: 'petit-groupe'
  },
  'salle-spectacle': {
    activity_types: ['concert', 'theatre', 'stand-up', 'projection'],
    ambiance: 'culturel',
    social_intensity: 'grand-groupe'
  },
  'activite': {
    activity_types: ['jeux-arcade', 'escape-game', 'bowling', 'tournoi'],
    ambiance: 'casual',
    social_intensity: 'petit-groupe'
  },
  'culture': {
    activity_types: ['exposition', 'visite-guidee', 'atelier', 'theatre'],
    ambiance: 'culturel',
    social_intensity: 'solo'
  },
  'espace-exterieur': {
    activity_types: ['concert', 'projection', 'networking'],
    ambiance: 'casual',
    social_intensity: 'moyen'
  }
};

// Legacy export for backward compatibility
export const popularTags = [
  'jazz', 'cocktails', 'happy-hour', 'dégustation', 'vin',
  'électro', 'dj', 'soirée', 'danse', 'clubbing',
  'fitness', 'yoga', 'crossfit', 'aqua', 'sport',
  'lyon', 'presquile', 'partdieu', 'confluence',
  'musique', 'live', 'concert', 'ambiance'
];
