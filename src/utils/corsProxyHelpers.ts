/**
 * Applique un proxy CORS pour les URLs Instagram/Facebook qui sont bloquées par CORS
 */
export const getProxiedImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // Si l'URL contient Instagram ou Facebook CDN, utilise le proxy CORS
  if (imageUrl.includes('cdninstagram.com') || imageUrl.includes('fbcdn.net')) {
    return `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
  }
  
  return imageUrl;
};

/**
 * URL d'une image destinée à l'EXTRACTION COULEUR via canvas (≠ affichage).
 * Le canvas exige des en-têtes CORS pour être lisible (getImageData). Beaucoup
 * d'hôtes de flyers (larayonne.org, cloudinary...) n'en renvoient pas → on les
 * fait passer par un proxy qui ajoute `Access-Control-Allow-Origin: *`.
 * Les images déjà sur notre Storage Supabase envoient les bons en-têtes : direct.
 */
export const getColorProbeUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  // Storage Supabase : CORS déjà OK, pas besoin de proxy (plus rapide).
  if (imageUrl.includes('supabase.co/storage')) return imageUrl;
  // Tout le reste : proxy qui garantit les en-têtes CORS pour le canvas.
  return `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
};

/**
 * URL de fallback en cas d'erreur de chargement d'image
 */
export const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400';

/**
 * Handler pour les erreurs d'image qui applique l'image de fallback
 */
export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.src = FALLBACK_IMAGE_URL;
};