import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { BusinessEvent } from '@/types/events';
import { 
  simulatedEvents, 
  generateAlerts, 
  benchmarks, 
  businessMetrics,
  Alert,
  SimulatedEvent,
  Benchmark
} from '@/data/simulatedAnalytics';

interface BusinessAnalyticsContextType {
  // Core data
  events: SimulatedEvent[];
  alerts: Alert[];
  benchmarks: Record<string, Benchmark>;
  metrics: typeof businessMetrics;
  
  // Loading states
  loading: boolean;
  
  // Actions
  refreshData: () => void;
  getEventAnalytics: (eventId: string) => SimulatedEvent | null;
  getBenchmarkForCategory: (category: string) => Benchmark | null;
}

const BusinessAnalyticsContext = createContext<BusinessAnalyticsContextType | undefined>(undefined);

export const BusinessAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [events] = useState<SimulatedEvent[]>(simulatedEvents);

  // Memoize expensive calculations
  const alerts = useMemo(() => {
    return generateAlerts(events);
  }, [events]);

  const getEventAnalytics = (eventId: string): SimulatedEvent | null => {
    return events.find(event => event.id === eventId) || null;
  };

  const getBenchmarkForCategory = (category: string): Benchmark | null => {
    return benchmarks[category] || null;
  };

  const refreshData = () => {
    setLoading(true);
    // Simulate data refresh with delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const value: BusinessAnalyticsContextType = {
    events,
    alerts,
    benchmarks,
    metrics: businessMetrics,
    loading,
    refreshData,
    getEventAnalytics,
    getBenchmarkForCategory
  };

  return (
    <BusinessAnalyticsContext.Provider value={value}>
      {children}
    </BusinessAnalyticsContext.Provider>
  );
};

export const useBusinessAnalytics = () => {
  const context = useContext(BusinessAnalyticsContext);
  if (context === undefined) {
    throw new Error('useBusinessAnalytics must be used within a BusinessAnalyticsProvider');
  }
  return context;
};