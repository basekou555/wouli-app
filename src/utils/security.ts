
// Utilitaires de sécurité pour l'application Wouli

/**
 * Assainit une chaîne HTML en supprimant les balises potentiellement dangereuses
 */
export const sanitizeHtml = (html: string): string => {
  // Liste blanche des balises autorisées (très restrictive)
  const allowedTags = ['b', 'i', 'em', 'strong', 'br', 'p', 'span'];
  const allowedAttributes = ['class'];
  
  // Supprimer toutes les balises script
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Supprimer les événements JavaScript
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Supprimer les balises non autorisées
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return '';
  });
  
  return sanitized;
};

/**
 * Valide une URL pour s'assurer qu'elle est sûre
 */
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Autoriser seulement HTTP et HTTPS
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Assainit les données utilisateur pour éviter les injections
 */
export const sanitizeUserInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Supprimer les caractères potentiellement dangereux
    .trim()
    .substring(0, 1000); // Limiter la longueur
};

/**
 * Valide les données d'événement pour la sécurité
 */
export const validateEventData = (eventData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validation du titre
  if (!eventData.title || typeof eventData.title !== 'string') {
    errors.push('Le titre est requis et doit être une chaîne de caractères');
  } else if (eventData.title.length > 200) {
    errors.push('Le titre ne peut pas dépasser 200 caractères');
  }
  
  // Validation de la description
  if (eventData.description && eventData.description.length > 2000) {
    errors.push('La description ne peut pas dépasser 2000 caractères');
  }
  
  // Validation de l'URL externe
  if (eventData.external_url && !validateUrl(eventData.external_url)) {
    errors.push('L\'URL externe n\'est pas valide');
  }
  
  // Validation de l'URL d'image
  if (eventData.image_url && !validateUrl(eventData.image_url)) {
    errors.push('L\'URL de l\'image n\'est pas valide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Encode les données pour éviter les injections dans les logs
 */
export const secureLog = (message: string, data?: any): void => {
  const sanitizedMessage = sanitizeUserInput(message);
  if (data) {
    // Éviter de logger des données sensibles
    const sanitizedData = JSON.stringify(data).replace(/("password"|"token"|"secret")[^,}]*/gi, '"[REDACTED]"');
    console.log(`[WOULI-SECURE] ${sanitizedMessage}`, JSON.parse(sanitizedData));
  } else {
    console.log(`[WOULI-SECURE] ${sanitizedMessage}`);
  }
};
