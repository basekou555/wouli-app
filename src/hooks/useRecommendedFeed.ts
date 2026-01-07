import { useState, useEffect, useMemo, useCallback } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { WouliRecommendationEngine, getRecommendationEngine, resetRecommendationEngine } from '@/services/WouliRecommendationEngine';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RecommendationScore {
  eventId: string;
  totalScore: number;
  breakdown: {
    preferences: number;
    social: number;
    urgency: number;
    discovery: number;
    context: number;
  };
  penalties: {
    repetition: number;
    price: number;
    distance: number;
  };
  badges: string[];
}

interface RecommendedEvent extends UnifiedEvent {
  recommendationScore: RecommendationScore;
}

interface SocialContext {
  friendsParticipating: string[];
  friendsLiked: string[];
  totalFriendsCount: number;
}

interface UseRecommendedFeedResult {
  recommendedEvents: RecommendedEvent[];
  allEvents: UnifiedEvent[];
  loading: boolean;
  error: Error | null;
  feedMode: 'recommended' | 'all';
  setFeedMode: (mode: 'recommended' | 'all') => void;
  refreshRecommendations: () => Promise<void>;
  getBadgesForEvent: (eventId: string) => string[];
}

export const useRecommendedFeed = (events: UnifiedEvent[]): UseRecommendedFeedResult => {
  const { user } = useAuth();
  const [engine, setEngine] = useState<WouliRecommendationEngine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [feedMode, setFeedMode] = useState<'recommended' | 'all'>('recommended');
  const [socialContexts, setSocialContexts] = useState<Map<string, SocialContext>>(new Map());
  const [friendsCount, setFriendsCount] = useState(0);

  // Initialize engine when user is available
  useEffect(() => {
    const initEngine = async () => {
      if (!user?.id) {
        setEngine(null);
        return;
      }

      try {
        setLoading(true);
        const recommendationEngine = await getRecommendationEngine(user.id);
        setEngine(recommendationEngine);
      } catch (err) {
        console.error('Failed to initialize recommendation engine:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    initEngine();
  }, [user?.id]);

  // Load social contexts for events
  useEffect(() => {
    const loadSocialContexts = async () => {
      if (!user?.id || events.length === 0) return;

      try {
        // Get user's friends
        const { data: friendships } = await supabase
          .from('friendships')
          .select('friend_id, user_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted');

        const friendIds = friendships?.map(f => 
          f.user_id === user.id ? f.friend_id : f.user_id
        ) || [];
        
        setFriendsCount(friendIds.length);

        if (friendIds.length === 0) return;

        // Get friends' participations
        const { data: participations } = await supabase
          .from('event_participants')
          .select('event_id, user_id')
          .in('user_id', friendIds)
          .in('event_id', events.map(e => e.id));

        // Get friends' likes
        const { data: likes } = await supabase
          .from('event_likes')
          .select('event_id, user_id')
          .in('user_id', friendIds)
          .in('event_id', events.map(e => e.id));

        // Build social contexts map
        const contexts = new Map<string, SocialContext>();
        
        events.forEach(event => {
          const eventParticipations = participations?.filter(p => p.event_id === event.id) || [];
          const eventLikes = likes?.filter(l => l.event_id === event.id) || [];
          
          contexts.set(event.id, {
            friendsParticipating: eventParticipations.map(p => p.user_id),
            friendsLiked: eventLikes.map(l => l.user_id),
            totalFriendsCount: friendIds.length
          });
        });

        setSocialContexts(contexts);
      } catch (err) {
        console.error('Failed to load social contexts:', err);
      }
    };

    loadSocialContexts();
  }, [user?.id, events]);

  // Calculate recommended events
  const recommendedEvents = useMemo((): RecommendedEvent[] => {
    if (!engine || events.length === 0) {
      // Return events with default scores when no engine
      return events.map(event => ({
        ...event,
        recommendationScore: {
          eventId: event.id,
          totalScore: 50,
          breakdown: { preferences: 50, social: 0, urgency: 50, discovery: 50, context: 50 },
          penalties: { repetition: 0, price: 0, distance: 0 },
          badges: []
        }
      }));
    }

    return engine.rankEvents(events, socialContexts);
  }, [engine, events, socialContexts]);

  // Get badges for a specific event
  const getBadgesForEvent = useCallback((eventId: string): string[] => {
    const event = recommendedEvents.find(e => e.id === eventId);
    return event?.recommendationScore.badges || [];
  }, [recommendedEvents]);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    if (!user?.id) return;
    
    resetRecommendationEngine();
    const newEngine = await getRecommendationEngine(user.id);
    setEngine(newEngine);
  }, [user?.id]);

  // Return events based on feed mode
  const displayEvents = feedMode === 'recommended' ? recommendedEvents : events.map(event => ({
    ...event,
    recommendationScore: recommendedEvents.find(e => e.id === event.id)?.recommendationScore || {
      eventId: event.id,
      totalScore: 50,
      breakdown: { preferences: 50, social: 0, urgency: 50, discovery: 50, context: 50 },
      penalties: { repetition: 0, price: 0, distance: 0 },
      badges: []
    }
  }));

  return {
    recommendedEvents: displayEvents,
    allEvents: events,
    loading,
    error,
    feedMode,
    setFeedMode,
    refreshRecommendations,
    getBadgesForEvent
  };
};
