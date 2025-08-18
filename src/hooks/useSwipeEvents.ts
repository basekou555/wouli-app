import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedEvent } from '@/types/unified';

interface SwipeEventsResult {
  currentEvent: UnifiedEvent | null;
  swipeLeft: () => Promise<void>;
  swipeRight: () => Promise<void>;
  noMoreEvents: boolean;
  resetAndReload: () => Promise<void>;
  totalEvents: number;
  currentIndex: number;
  setIndex: (idx: number) => void;
}

export const useSwipeEvents = (): SwipeEventsResult => {
  const { user } = useAuth();
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [noMoreEvents, setNoMoreEvents] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentEvent = useMemo(() => events[currentIndex] ?? null, [events, currentIndex]);

  const loadEvents = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch viewed events for user
    const { data: viewed, error: viewedErr } = await supabase
      .from('event_views')
      .select('event_id')
      .eq('user_id', user.id);

    if (viewedErr) {
      console.error('Failed fetching viewed events', viewedErr);
    }

    const viewedIds = (viewed || []).map(v => v.event_id);

    // Fetch upcoming events not viewed yet and not archived
    const { data: upcoming, error } = await (supabase as any)
      .from('events')
      .select('*')
      .neq('status', 'archived')
      .gte('date', new Date().toISOString())
      .order('date', { ascending: true })
      .limit(40);

    if (error) {
      console.error('Failed fetching events', error);
      setNoMoreEvents(true);
      setEvents([]);
      setLoading(false);
      return;
    }

    const filtered = viewedIds.length > 0 ? (upcoming || []).filter(e => !viewedIds.includes(e.id)) : (upcoming || []);

    if (filtered.length > 0) {
      setEvents(filtered as unknown as UnifiedEvent[]);
      setCurrentIndex(0);
      setNoMoreEvents(false);
    } else {
      setNoMoreEvents(true);
      setEvents([]);
    }

    setLoading(false);
  };

  const markAsViewed = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('event_views')
      .upsert(
        { user_id: user.id, event_id: eventId },
        { onConflict: 'user_id,event_id', ignoreDuplicates: true }
      );
    if (error) console.error('Failed marking as viewed', error);
  };

  const likeIfNeeded = async (eventId: string) => {
    if (!user) return;
    // Guard against duplicates by checking existing
    const { data: existing } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase
        .from('event_likes')
        .insert({ event_id: eventId, user_id: user.id });
      if (error) console.error('Failed to like on swipe', error);
    }
  };

  const swipeLeft = async () => {
    if (!currentEvent) return;
    await markAsViewed(currentEvent.id);
    if (currentIndex < events.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setNoMoreEvents(true);
    }
  };

  const swipeRight = async () => {
    if (!currentEvent) return;
    await markAsViewed(currentEvent.id);
    await likeIfNeeded(currentEvent.id);
    if (currentIndex < events.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setNoMoreEvents(true);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    currentEvent,
    swipeLeft,
    swipeRight,
    noMoreEvents,
    resetAndReload: loadEvents,
    totalEvents: events.length,
    currentIndex,
    setIndex: setCurrentIndex
  };
};
