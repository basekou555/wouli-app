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

  // Track une interaction avec calcul de durée et interprétation - FLUSH DIRECT
  const trackInteraction = useCallback(async (
    eventId: string,
    action: InteractionAction,
    event: UnifiedEvent
  ) => {
    if (!user) {
      console.log('⚠️ No user - skipping tracking');
      return;
    }

    const viewStartTime = viewStartTimes.current.get(eventId);
    const duration = viewStartTime ? Date.now() - viewStartTime : 0;
    const signal = interpretSignal(action, duration);

    // Update session metrics
    if (action === 'like') sessionMetrics.current.likes++;
    if (action === 'dislike' || action === 'skip') sessionMetrics.current.dislikes++;
    if (action === 'participate') sessionMetrics.current.participates++;
    if (duration > 0) sessionMetrics.current.decisionTimes.push(duration);
    
    viewStartTimes.current.delete(eventId);

    // FLUSH DIRECT - Pas de buffer
    const record = {
      user_id: user.id,
      event_id: eventId,
      session_id: sessionId,
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
      }
    };

    console.log('📤 Inserting interaction:', { eventId, action, signal, userId: user.id });
    
    const { data, error } = await supabase
      .from('event_interactions')
      .insert(record)
      .select();

    if (error) {
      console.error('❌ Error saving interaction:', error.message, error.details, error.hint);
    } else {
      console.log('✅ Interaction saved:', data);
    }

    // Aussi tracker dans user_event_views pour les pénalités de répétition
    if (action === 'view' || action === 'like' || action === 'participate') {
      await trackEventView(eventId);
    }

    return { duration, signal };
  }, [user, sessionId]);

  // Track les vues d'événements pour les pénalités de répétition
  const trackEventView = useCallback(async (eventId: string) => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Try insert first, if conflict then ignore (already tracked today)
    const { error } = await supabase
      .from('user_event_views')
      .insert({ 
        event_id: eventId, 
        user_id: user.id, 
        source: 'app',
        view_date: today
      });

    // Ignore duplicate key error (23505) - already viewed today
    if (error && error.code !== '23505') {
      console.error('❌ Error tracking view:', error.message);
    }
  }, [user]);

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

  return {
    sessionId,
    startViewTracking,
    stopViewTracking,
    trackInteraction,
    trackEventView,
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
