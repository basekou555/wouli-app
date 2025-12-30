import { useState, useCallback, useEffect } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { ApiError } from '@/types/api';
import { fetchAllEventsPaginated, PaginatedResult } from '@/services/unifiedEventService';
import { useSimpleEventInteractions } from '@/hooks/useSimpleEventInteractions';

interface UsePaginatedEventsResult {
  events: UnifiedEvent[];
  loading: boolean;
  loadingMore: boolean;
  error: ApiError | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  incrementViews: (eventId: string) => Promise<boolean>;
  likeEvent: (eventId: string, eventTitle?: string) => Promise<boolean>;
  participateEvent: (eventId: string, eventTitle?: string, status?: 'going' | 'interested') => Promise<boolean>;
  clearError: () => void;
}

const PAGE_SIZE = 10;

export const usePaginatedEvents = (): UsePaginatedEventsResult => {
  const [events, setEvents] = useState<UnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const { handleIncrementViews, handleLike, handleParticipate } = useSimpleEventInteractions();

  const fetchInitialEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result: PaginatedResult<UnifiedEvent> = await fetchAllEventsPaginated(0, PAGE_SIZE);
      
      setEvents(result.data);
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);
      setPage(0);
    } catch (err: any) {
      console.error('Error fetching initial events:', err);
      setError({
        message: err.message || 'Erreur lors du chargement des événements',
        code: err.code,
        details: err
      });
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      
      const nextPage = page + 1;
      const result: PaginatedResult<UnifiedEvent> = await fetchAllEventsPaginated(nextPage, PAGE_SIZE);
      
      setEvents(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err: any) {
      console.error('Error loading more events:', err);
      setError({
        message: err.message || 'Erreur lors du chargement',
        code: err.code,
        details: err
      });
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore]);

  useEffect(() => {
    fetchInitialEvents();
  }, [fetchInitialEvents]);

  return {
    events,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch: fetchInitialEvents,
    incrementViews: handleIncrementViews,
    likeEvent: handleLike,
    participateEvent: handleParticipate,
    clearError: () => setError(null)
  };
};
