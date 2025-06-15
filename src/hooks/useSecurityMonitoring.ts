
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurity } from '@/hooks/useSecurity';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  type: 'auth_failure' | 'rls_violation' | 'rate_limit' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  timestamp: string;
}

export const useSecurityMonitoring = () => {
  const { logSecurityEvent } = useSecurity();
  const { toast } = useToast();

  // Surveiller les échecs d'authentification répétés
  const monitorAuthFailures = useCallback(() => {
    let failureCount = 0;
    const resetTime = 15 * 60 * 1000; // 15 minutes

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && !session) {
        failureCount++;
        
        if (failureCount >= 3) {
          const alert: SecurityAlert = {
            type: 'auth_failure',
            severity: 'high',
            message: `${failureCount} échecs d'authentification successifs détectés`,
            timestamp: new Date().toISOString()
          };
          
          logSecurityEvent({
            type: 'suspicious_activity',
            details: alert.message
          });

          // Alerte utilisateur en cas d'activité suspecte
          toast({
            title: "⚠️ Activité suspecte détectée",
            description: "Plusieurs tentatives de connexion échouées. Vérifiez la sécurité de votre compte.",
            variant: "destructive"
          });
        }

        // Reset du compteur après la période
        setTimeout(() => {
          failureCount = Math.max(0, failureCount - 1);
        }, resetTime);
      }
    });
  }, [logSecurityEvent, toast]);

  // Surveiller les erreurs de base de données pour détecter les violations RLS
  const monitorDatabaseErrors = useCallback((error: any, operation: string) => {
    const isRLSViolation = error?.message?.includes('permission denied') || 
                          error?.message?.includes('RLS') ||
                          error?.message?.includes('policy');

    if (isRLSViolation) {
      const alert: SecurityAlert = {
        type: 'rls_violation',
        severity: 'critical',
        message: `Violation de politique RLS lors de ${operation}: ${error.message}`,
        timestamp: new Date().toISOString()
      };

      logSecurityEvent({
        type: 'rls_violation',
        details: alert.message
      });

      console.error('[SECURITY ALERT]', alert);
    }
  }, [logSecurityEvent]);

  // Surveiller les patterns d'activité inhabituels
  const monitorActivityPatterns = useCallback(() => {
    const activityLog: { [key: string]: number[] } = {};
    
    return (userId: string, action: string) => {
      const now = Date.now();
      const key = `${userId}:${action}`;
      
      if (!activityLog[key]) {
        activityLog[key] = [];
      }
      
      activityLog[key].push(now);
      
      // Garder seulement les actions des 5 dernières minutes
      activityLog[key] = activityLog[key].filter(time => now - time < 5 * 60 * 1000);
      
      // Détecter une activité anormalement élevée (plus de 20 actions en 5 minutes)
      if (activityLog[key].length > 20) {
        const alert: SecurityAlert = {
          type: 'suspicious_activity',
          severity: 'medium',
          message: `Activité anormalement élevée détectée pour l'utilisateur ${userId}: ${activityLog[key].length} ${action} en 5 minutes`,
          userId,
          timestamp: new Date().toISOString()
        };

        logSecurityEvent({
          type: 'suspicious_activity',
          details: alert.message,
          userId
        });
      }
    };
  }, [logSecurityEvent]);

  // Initialiser le monitoring
  useEffect(() => {
    monitorAuthFailures();
  }, [monitorAuthFailures]);

  return {
    monitorDatabaseErrors,
    monitorActivityPatterns: monitorActivityPatterns()
  };
};
