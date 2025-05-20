
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchEvents, EventData } from '../services/eventService';
import { useToast } from '@/hooks/use-toast';

// Constants
const ITEMS_PER_PAGE = 9;

export const useEvents = () => {
  // State management
  const [feedFilter, setFeedFilter] = useState<'all' | 'future' | 'past'>('all');
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Hooks
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch events function
  const fetchEventData = useCallback(async (reset = false) => {
    if (!user) return;
    
    try {
      const currentPage = reset ? 1 : page;
      setLoading(true);
      setError(null);
      
      if (reset) {
        setEvents([]);
      }
      
      const eventsData = await fetchEvents(feedFilter, currentPage, ITEMS_PER_PAGE);
      
      if (reset) {
        setEvents(eventsData);
      } else {
        setEvents(prev => [...prev, ...eventsData]);
      }
      
      setHasMore(eventsData.length === ITEMS_PER_PAGE);
      setPage(currentPage + 1);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError("Impossible de charger les événements. Veuillez réessayer.");
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [user, feedFilter, page, toast]);

  // Initial data loading effect
  useEffect(() => {
    fetchEventData(true);
  }, [feedFilter, user]);

  // Handle refresh functionality
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEventData(true);
  }, [fetchEventData]);

  // Update feed filter
  const handleFilterChange = useCallback((newFilter: 'all' | 'future' | 'past') => {
    setFeedFilter(newFilter);
    setPage(1);
  }, []);

  return {
    events,
    loading,
    initialLoading,
    error,
    hasMore,
    refreshing,
    feedFilter,
    fetchEventData,
    handleRefresh,
    handleFilterChange
  };
};
