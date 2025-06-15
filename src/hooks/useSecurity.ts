
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/utils/security';

interface SecurityEvent {
  type: 'failed_auth' | 'suspicious_activity' | 'rls_violation' | 'invalid_input';
  details: string;
  userId?: string;
  timestamp: string;
}

export const useSecurity = () => {
  // Fonction pour enregistrer un événement de sécurité
  const logSecurityEvent = useCallback(async (event: Omit<SecurityEvent, 'timestamp'>) => {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };
    
    secureLog('Security event detected', securityEvent);
    
    // En production, on pourrait envoyer ces événements à un service de monitoring
    // ou les stocker dans une table dédiée aux logs de sécurité
  }, []);

  // Surveiller les échecs d'authentification
  const monitorAuthFailures = useCallback(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && !session) {
        // Potentielle déconnexion forcée
        logSecurityEvent({
          type: 'failed_auth',
          details: 'User signed out - potential session invalidation'
        });
      }
    });
  }, [logSecurityEvent]);

  // Détecter les activités suspectes dans les requêtes
  const monitorDatabaseErrors = useCallback((error: any, operation: string) => {
    if (error?.message?.includes('permission denied') || 
        error?.message?.includes('RLS') ||
        error?.message?.includes('policy')) {
      logSecurityEvent({
        type: 'rls_violation',
        details: `RLS policy violation during ${operation}: ${error.message}`
      });
    }
  }, [logSecurityEvent]);

  // Valider les entrées utilisateur suspectes
  const validateUserInput = useCallback((input: string, fieldName: string): boolean => {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i,
      /expression\(/i
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(input));
    
    if (isSuspicious) {
      logSecurityEvent({
        type: 'invalid_input',
        details: `Suspicious input detected in ${fieldName}: ${input.substring(0, 100)}`
      });
      return false;
    }
    
    return true;
  }, [logSecurityEvent]);

  useEffect(() => {
    monitorAuthFailures();
  }, [monitorAuthFailures]);

  return {
    logSecurityEvent,
    monitorDatabaseErrors,
    validateUserInput
  };
};
