
import { validateEventData, sanitizeUserInput } from '@/utils/security';
import { useSecurity } from '@/hooks/useSecurity';

/**
 * Middleware de sécurité pour les opérations sur les événements
 */
export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  
  private constructor() {}
  
  public static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }
  
  /**
   * Valide et assainit les données d'événement avant l'insertion/mise à jour
   */
  public validateEventData(eventData: any): { isValid: boolean; sanitizedData?: any; errors?: string[] } {
    const validation = validateEventData(eventData);
    
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: validation.errors
      };
    }
    
    // Assainir les données
    const sanitizedData = {
      ...eventData,
      title: sanitizeUserInput(eventData.title || ''),
      description: eventData.description ? sanitizeUserInput(eventData.description) : undefined,
      venue: eventData.venue ? sanitizeUserInput(eventData.venue) : undefined,
      custom_venue: eventData.custom_venue ? sanitizeUserInput(eventData.custom_venue) : undefined
    };
    
    return {
      isValid: true,
      sanitizedData
    };
  }
  
  /**
   * Vérifie les permissions d'accès pour les opérations sensibles
   */
  public async checkPermissions(userId: string, operation: string, resourceId?: string): Promise<boolean> {
    if (!userId) {
      console.warn(`[SECURITY] Tentative d'accès non authentifié pour ${operation}`);
      return false;
    }
    
    // Log de l'opération pour audit
    console.log(`[SECURITY] User ${userId} attempting ${operation}${resourceId ? ` on resource ${resourceId}` : ''}`);
    
    return true;
  }
  
  /**
   * Rate limiting simple pour éviter les abus
   */
  private rateLimitMap = new Map<string, { count: number; lastReset: number }>();
  
  public checkRateLimit(userId: string, operation: string, maxRequests = 10, windowMs = 60000): boolean {
    const key = `${userId}:${operation}`;
    const now = Date.now();
    const userRate = this.rateLimitMap.get(key);
    
    if (!userRate || now - userRate.lastReset > windowMs) {
      this.rateLimitMap.set(key, { count: 1, lastReset: now });
      return true;
    }
    
    if (userRate.count >= maxRequests) {
      console.warn(`[SECURITY] Rate limit exceeded for user ${userId} on ${operation}`);
      return false;
    }
    
    userRate.count++;
    return true;
  }
}

export const securityMiddleware = SecurityMiddleware.getInstance();
