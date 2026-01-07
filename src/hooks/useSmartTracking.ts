import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedEvent } from '@/types/unified';

// Types de signaux interprétés basés sur la durée de décision
export type SignalInterpretation = 
  | 'instant_love'      // Like < 1s - Coup de cœur immédiat
  | 'quick_positive'    // Like 1-2s - Réaction positive rapide
  | 'normal_positive'   // Like 2-5s - Décision réfléchie positive
  | 'hesitation'        // Like > 5s - Hésitation avant like
  | 'quick_negative'    // Dislike < 1s - Rejet immédiat (blacklist potentiel)
  | 'considered_skip'   // Dislike 1-3s - Skip après considération
  | 'slow_negative'     // Dislike > 3s - Hésitation avant rejet
  | 'instant_commit'    // Participate < 2s - Engagement immédiat
  | 'planned_commit'    // Participate > 2s - Engagement réfléchi
  | 'view_only';        // Pas d'action après vue

export type InteractionAction = 'view' | 'like' | 'dislike' | 'participate' | 'share' | 'skip';

interface TrackedInteraction {
  event_id: string;
  action: InteractionAction;
  duration_ms: number;
  signal_interpretation: SignalInterpretation;
  position_in_session: number;
  device_type: string;
  event_snapshot: {
    title: string;
    category: string;
    tags?: string[];
    price?: number;
    location: string;
  };
  created_at: string;
}

interface SessionMetrics {
  total_views: number;
  total_likes: number;
  total_dislikes: number;
  total_participates: number;
  avg_decision_time_ms: number;
  like_rate: number;
  session_duration_ms: number;
}

// Interprète le signal basé sur l'action et la durée
const interpretSignal = (action: InteractionAction, durationMs: number): SignalInterpretation => {
  switch (action) {
    case 'like':
      if (durationMs < 1000) return 'instant_love';
      if (durationMs < 2000) return 'quick_positive';
      if (durationMs < 5000) return 'normal_positive';
      return 'hesitation';
    
    case 'dislike':
    case 'skip':
      if (durationMs < 1000) return 'quick_negative';
      if (durationMs < 3000) return 'considered_skip';
      return 'slow_negative';
    
    case 'participate':
      if (durationMs < 2000) return 'instant_commit';
      return 'planned_commit';
    
    default:
      return 'view_only';
  }
};

// Détecte le type d'appareil
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Mobile/.test(ua)) return 'mobile';
  return 'desktop';
};

// Génère un ID de session unique
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useSmartTracking = () => {
  const { user } = useAuth();
  const [sessionId] = useState(() => generateSessionId());
  const [sessionStartTime] = useState(() => Date.now());
  
  // Tracking state
  const viewStartTimes = useRef<Map<string, number>>(new Map());
  const interactionBuffer = useRef<TrackedInteraction[]>([]);
  const positionCounter = useRef(0);
  
  // Session metrics
  const sessionMetrics = useRef<{
    views: number;
    likes: number;
    dislikes: number;
    participates: number;
    decisionTimes: number[];
  }>({
    views: 0,
    likes: 0,
    dislikes: 0,
    participates: 0,
    decisionTimes: []
  });

  // Démarre le tracking d'une vue
  const startViewTracking = useCallback((eventId: string) => {
    viewStartTimes.current.set(eventId, Date.now());
    sessionMetrics.current.views++;
    positionCounter.current++;
  }, []);

  // Arrête le tracking d'une vue (si l'utilisateur navigue sans action)
  const stopViewTracking = useCallback((eventId: string) => {
    viewStartTimes.current.delete(eventId);
  }, []);

  // Track une interaction avec calcul de durée et interprétation
  const trackInteraction = useCallback((
    eventId: string,
    action: InteractionAction,
    event: UnifiedEvent
  ) => {
    if (!user) return;

    const viewStartTime = viewStartTimes.current.get(eventId);
    const duration = viewStartTime ? Date.now() - viewStartTime : 0;
    const signal = interpretSignal(action, duration);

    // Update session metrics
    if (action === 'like') sessionMetrics.current.likes++;
    if (action === 'dislike' || action === 'skip') sessionMetrics.current.dislikes++;
    if (action === 'participate') sessionMetrics.current.participates++;
    if (duration > 0) sessionMetrics.current.decisionTimes.push(duration);

    const interaction: TrackedInteraction = {
      event_id: eventId,
      action,
      duration_ms: duration,
      signal_interpretation: signal,
      position_in_session: positionCounter.current,
      device_type: getDeviceType(),
      event_snapshot: {
        title: event.title,
        category: event.category,
        tags: event.tags,
        price: event.price_text ? parseFloat(String(event.price_text).replace(/[^0-9.]/g, '')) || undefined : undefined,
        location: event.location
      },
      created_at: new Date().toISOString()
    };

    interactionBuffer.current.push(interaction);
    viewStartTimes.current.delete(eventId);

    // Flush buffer when it reaches 10 interactions
    if (interactionBuffer.current.length >= 10) {
      flushInteractions();
    }

    // Log pour debug en dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 Tracked: ${action} on "${event.title}" - ${duration}ms - ${signal}`);
    }

    return { duration, signal };
  }, [user]);

  // Envoie les interactions en batch vers Supabase
  const flushInteractions = useCallback(async () => {
    if (!user || interactionBuffer.current.length === 0) return;

    const interactions = [...interactionBuffer.current];
    interactionBuffer.current = [];

    try {
      const records = interactions.map(interaction => ({
        user_id: user.id,
        event_id: interaction.event_id,
        session_id: sessionId,
        action: interaction.action,
        duration_ms: interaction.duration_ms,
        signal_interpretation: interaction.signal_interpretation,
        position_in_session: interaction.position_in_session,
        device_type: interaction.device_type,
        event_snapshot: interaction.event_snapshot,
        created_at: interaction.created_at
      }));

      const { error } = await supabase
        .from('event_interactions')
        .insert(records);

      if (error) {
        console.error('Error saving interactions:', error);
        // Re-add failed interactions to buffer
        interactionBuffer.current.unshift(...interactions);
      }
    } catch (error) {
      console.error('Error flushing interactions:', error);
      interactionBuffer.current.unshift(...interactions);
    }
  }, [user, sessionId]);

  // Calcule les métriques de session
  const getSessionMetrics = useCallback((): SessionMetrics => {
    const { views, likes, dislikes, participates, decisionTimes } = sessionMetrics.current;
    const avgDecisionTime = decisionTimes.length > 0
      ? decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length
      : 0;
    
    return {
      total_views: views,
      total_likes: likes,
      total_dislikes: dislikes,
      total_participates: participates,
      avg_decision_time_ms: Math.round(avgDecisionTime),
      like_rate: views > 0 ? likes / views : 0,
      session_duration_ms: Date.now() - sessionStartTime
    };
  }, [sessionStartTime]);

  // Flush au démontage du composant
  useEffect(() => {
    return () => {
      flushInteractions();
    };
  }, [flushInteractions]);

  // Flush périodique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (interactionBuffer.current.length > 0) {
        flushInteractions();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [flushInteractions]);

  // Flush avant fermeture de page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (interactionBuffer.current.length > 0 && user) {
        // Use sendBeacon for reliable delivery on page close
        const records = interactionBuffer.current.map(interaction => ({
          user_id: user.id,
          event_id: interaction.event_id,
          session_id: sessionId,
          action: interaction.action,
          duration_ms: interaction.duration_ms,
          signal_interpretation: interaction.signal_interpretation,
          position_in_session: interaction.position_in_session,
          device_type: interaction.device_type,
          event_snapshot: interaction.event_snapshot,
          created_at: interaction.created_at
        }));

        // Using navigator.sendBeacon for reliable delivery
        const url = `https://ddvboxgescsptvhkjgjl.supabase.co/rest/v1/event_interactions`;
        navigator.sendBeacon(url, JSON.stringify(records));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user, sessionId]);

  return {
    sessionId,
    startViewTracking,
    stopViewTracking,
    trackInteraction,
    flushInteractions,
    getSessionMetrics,
    interpretSignal
  };
};

// Hook simplifié pour utiliser dans les composants enfants
export const useEventTracking = (eventId: string, event: UnifiedEvent) => {
  const tracking = useSmartTracking();
  const hasStartedTracking = useRef(false);

  // Démarre automatiquement le tracking quand le composant monte
  useEffect(() => {
    if (!hasStartedTracking.current && eventId) {
      tracking.startViewTracking(eventId);
      hasStartedTracking.current = true;
    }

    return () => {
      if (hasStartedTracking.current) {
        tracking.stopViewTracking(eventId);
      }
    };
  }, [eventId, tracking]);

  const trackAction = useCallback((action: InteractionAction) => {
    return tracking.trackInteraction(eventId, action, event);
  }, [eventId, event, tracking]);

  return {
    trackAction,
    sessionId: tracking.sessionId
  };
};
