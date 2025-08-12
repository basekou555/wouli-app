import { useState, useEffect } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { 
  hybridAnalyticsService, 
  RealTimeMetrics, 
  BenchmarkData 
} from '@/services/hybridAnalyticsService';
import { useAuth } from '@/contexts/AuthContext';

interface EventAnalyticsData {
  metrics: RealTimeMetrics | null;
  benchmark: BenchmarkData | null;
  categoryRank: { rank: number; total: number } | null;
  insights: Array<{
    type: 'positive' | 'warning' | 'opportunity';
    title: string;
    description: string;
    action?: string;
  }>;
  loading: boolean;
  error: string | null;
}

export const useEventAnalytics = (event: UnifiedEvent | null) => {
  const { user } = useAuth();
  const [data, setData] = useState<EventAnalyticsData>({
    metrics: null,
    benchmark: null,
    categoryRank: null,
    insights: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!event) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const loadAnalytics = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Calculate real-time metrics
        const realTimeMetrics = hybridAnalyticsService.calculateRealTimeMetrics(event);
        
        // Apply demo mode if applicable
        const metrics = hybridAnalyticsService.applyDemoMode(
          realTimeMetrics, 
          user?.id === 'demo-account' ? 'demo-account' : undefined
        );

        // Get benchmark data (cached)
        const benchmark = await hybridAnalyticsService.getBenchmark(event.category);
        
        // Get category rank
        const categoryRank = await hybridAnalyticsService.getCategoryRank(event);

        // Generate insights
        const insights = hybridAnalyticsService.generateInsights(metrics, benchmark);

        setData({
          metrics,
          benchmark,
          categoryRank,
          insights,
          loading: false,
          error: null
        });

        // Save snapshot for historical tracking (don't wait)
        if (benchmark) {
          hybridAnalyticsService.saveSnapshot(
            'event',
            event.id,
            metrics,
            {
              category: benchmark.category,
              avg_conversion: benchmark.avg_conversion,
              rank: categoryRank?.rank || null,
              total_in_category: categoryRank?.total || null
            }
          ).catch(console.error);
        }

      } catch (error) {
        console.error('Error loading event analytics:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Erreur lors du chargement des analytics'
        }));
      }
    };

    loadAnalytics();
  }, [event, user?.id]);

  const refreshAnalytics = () => {
    if (event) {
      // Clear cache and reload
      hybridAnalyticsService.clearCache();
      setData(prev => ({ ...prev, loading: true }));
      
      // Trigger re-fetch
      setTimeout(() => {
        const loadAnalytics = async () => {
          const realTimeMetrics = hybridAnalyticsService.calculateRealTimeMetrics(event);
          const metrics = hybridAnalyticsService.applyDemoMode(
            realTimeMetrics, 
            user?.id === 'demo-account' ? 'demo-account' : undefined
          );
          const benchmark = await hybridAnalyticsService.getBenchmark(event.category);
          const categoryRank = await hybridAnalyticsService.getCategoryRank(event);
          const insights = hybridAnalyticsService.generateInsights(metrics, benchmark);

          setData({
            metrics,
            benchmark,
            categoryRank,
            insights,
            loading: false,
            error: null
          });
        };
        
        loadAnalytics().catch((error) => {
          setData(prev => ({
            ...prev,
            loading: false,
            error: 'Erreur lors du rafraîchissement'
          }));
        });
      }, 100);
    }
  };

  return {
    ...data,
    refreshAnalytics
  };
};