/**
 * Applique un proxy CORS pour les URLs Instagram/Facebook qui sont bloquées par CORS
 */
export const getProxiedImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // Si l'URL contient Instagram ou Facebook CDN, utilise wsrv.nl pour proxy et optimisation
  if (imageUrl.includes('cdninstagram.com') || imageUrl.includes('fbcdn.net')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&w=400&h=400&fit=cover`;
  }
  
  return imageUrl;
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