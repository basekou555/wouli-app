import { supabase } from "@/integrations/supabase/client";
import { UnifiedEvent } from "@/types/unified";

// Demo multipliers for pilots - realistic values
const DEMO_MULTIPLIERS = {
  views: 2.8,        
  likes: 2.5,        
  participants: 3.1, 
  conversion_rate: 1.1 // Slight improvement only
};

interface RealTimeMetrics {
  views: number;
  likes: number;
  participants: number;
  conversion_rate: number;
  like_rate: number;
  engagement_score: number;
}

interface BenchmarkData {
  avg_views: number;
  avg_participants: number;
  avg_conversion: number;
  top_performer: number;
  category: string;
  total_events: number;
  cached_at: Date;
}

interface AnalyticsSnapshot {
  id: string;
  entity_type: 'event' | 'establishment';
  entity_id: string;
  period_type: 'daily';
  metrics: Record<string, any>;
  benchmark: Record<string, any>;
  created_at: string;
}

class HybridAnalyticsService {
  private benchmarkCache = new Map<string, { data: BenchmarkData; timestamp: number }>();
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds

  // Real-time metrics calculation from DB data
  calculateRealTimeMetrics(event: UnifiedEvent): RealTimeMetrics {
    const views = event.views || 0;
    const likes = event.likes || 0;
    const participants = event.participants || 0;
    
    const conversion_rate = views > 0 ? (participants / views) * 100 : 0;
    const like_rate = views > 0 ? (likes / views) * 100 : 0;
    const engagement_score = Math.round((like_rate + conversion_rate) / 2);

    return {
      views,
      likes,
      participants,
      conversion_rate: Math.round(conversion_rate * 100) / 100,
      like_rate: Math.round(like_rate * 100) / 100,
      engagement_score
    };
  }

  // Apply demo mode with variance for realism
  applyDemoMode(metrics: RealTimeMetrics, businessId?: string): RealTimeMetrics {
    if (businessId !== 'demo-account') return metrics;
    
    // Add variance ±20% for realism
    const variance = 0.8 + Math.random() * 0.4;
    
    return {
      views: Math.round(metrics.views * DEMO_MULTIPLIERS.views * variance),
      likes: Math.round(metrics.likes * DEMO_MULTIPLIERS.likes * variance),
      participants: Math.round(metrics.participants * DEMO_MULTIPLIERS.participants * variance),
      conversion_rate: Math.round(metrics.conversion_rate * DEMO_MULTIPLIERS.conversion_rate * variance * 100) / 100,
      like_rate: Math.round(metrics.like_rate * DEMO_MULTIPLIERS.likes * variance * 100) / 100,
      engagement_score: Math.round((metrics.like_rate + metrics.conversion_rate) * DEMO_MULTIPLIERS.conversion_rate * variance / 2)
    };
  }

  // Benchmark calculation with 1h cache
  async getBenchmark(category: string): Promise<BenchmarkData | null> {
    const cacheKey = `benchmark_${category}`;
    const cached = this.benchmarkCache.get(cacheKey);
    
    // Return cached if still valid (1h)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Calculate benchmark from business_events
      const { data: events, error } = await supabase
        .from('business_events')
        .select('views, likes, participants, category')
        .eq('category', category)
        .gte('views', 1); // Only events with actual data

      if (error || !events || events.length < 3) {
        return null; // Need at least 3 events for meaningful benchmark
      }

      const validEvents = events.filter(e => e.views > 0);
      
      const avg_views = validEvents.reduce((sum, e) => sum + e.views, 0) / validEvents.length;
      const avg_participants = validEvents.reduce((sum, e) => sum + e.participants, 0) / validEvents.length;
      const conversions = validEvents.map(e => (e.participants / e.views) * 100);
      const avg_conversion = conversions.reduce((sum, c) => sum + c, 0) / conversions.length;
      const top_performer = Math.max(...conversions);

      const benchmarkData: BenchmarkData = {
        avg_views: Math.round(avg_views),
        avg_participants: Math.round(avg_participants),
        avg_conversion: Math.round(avg_conversion * 100) / 100,
        top_performer: Math.round(top_performer * 100) / 100,
        category,
        total_events: validEvents.length,
        cached_at: new Date()
      };

      // Cache for 1h
      this.benchmarkCache.set(cacheKey, {
        data: benchmarkData,
        timestamp: Date.now()
      });

      return benchmarkData;
    } catch (error) {
      console.error('Error calculating benchmark:', error);
      return null;
    }
  }

  // Get category rank for an event
  async getCategoryRank(event: UnifiedEvent): Promise<{ rank: number; total: number } | null> {
    try {
      const { data: events, error } = await supabase
        .from('business_events')
        .select('id, views, participants')
        .eq('category', event.category)
        .gte('views', 1)
        .order('participants', { ascending: false });

      if (error || !events) return null;

      const eventConversion = event.views > 0 ? (event.participants / event.views) * 100 : 0;
      const eventIndex = events.findIndex(e => 
        e.id === event.id || 
        (e.participants / Math.max(e.views, 1)) * 100 <= eventConversion
      );

      return {
        rank: eventIndex >= 0 ? eventIndex + 1 : events.length + 1,
        total: events.length
      };
    } catch (error) {
      console.error('Error calculating category rank:', error);
      return null;
    }
  }

  // Save analytics snapshot (daily)
  async saveSnapshot(
    entityType: 'event' | 'establishment',
    entityId: string,
    metrics: Record<string, any>,
    benchmark?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_snapshots')
        .upsert({
          entity_type: entityType,
          entity_id: entityId,
          period_type: 'daily',
          metrics,
          benchmark: benchmark || null
        }, {
          onConflict: 'entity_type,entity_id,period_type,created_at::date'
        });

      if (error) {
        console.error('Error saving analytics snapshot:', error);
      }
    } catch (error) {
      console.error('Error saving analytics snapshot:', error);
    }
  }

  // Generate actionable insights
  generateInsights(metrics: RealTimeMetrics, benchmark: BenchmarkData | null): Array<{
    type: 'positive' | 'warning' | 'opportunity';
    title: string;
    description: string;
    action?: string;
  }> {
    const insights = [];

    if (benchmark) {
      // Positive insight - excellent conversion
      if (metrics.conversion_rate > benchmark.avg_conversion * 1.5) {
        insights.push({
          type: 'positive' as const,
          title: 'Excellent taux de conversion !',
          description: `${metrics.conversion_rate}% vs ${benchmark.avg_conversion}% en moyenne`,
          action: 'Dupliquer cet événement'
        });
      }

      // Warning insight - low engagement
      if (metrics.views > benchmark.avg_views && metrics.conversion_rate < benchmark.avg_conversion * 0.5) {
        insights.push({
          type: 'warning' as const,
          title: 'Beaucoup de vues, peu de participants',
          description: `${metrics.views} vues mais seulement ${metrics.conversion_rate}% de conversion`,
          action: 'Revoir la description ou le prix'
        });
      }

      // Opportunity insight - growing interest
      if (metrics.like_rate > benchmark.avg_conversion && metrics.conversion_rate < metrics.like_rate) {
        insights.push({
          type: 'opportunity' as const,
          title: 'Intérêt élevé, conversion à optimiser',
          description: `${metrics.like_rate}% de likes, ${metrics.conversion_rate}% de participation`,
          action: 'Simplifier l\'inscription ou ajuster le prix'
        });
      }
    }

    return insights.slice(0, 3); // Max 3 insights
  }

  // Calculate performance score from metrics
  calculatePerformanceScore(metrics: RealTimeMetrics): number {
    const { views, likes, participants, conversion_rate, like_rate, engagement_score } = metrics;
    
    // Weighted scoring algorithm
    const viewsScore = Math.min((views / 200) * 100, 100); // Max at 200 views
    const likeScore = Math.min(like_rate * 2, 100); // Max at 50% like rate
    const conversionScore = Math.min(conversion_rate * 5, 100); // Max at 20% conversion
    const engagementWeight = Math.min(engagement_score * 10, 100); // Max at 10 engagement score
    
    return (viewsScore * 0.3 + likeScore * 0.25 + conversionScore * 0.3 + engagementWeight * 0.15);
  }

  // Clear cache (for testing or manual refresh)
  clearCache(): void {
    this.benchmarkCache.clear();
  }
}

export const hybridAnalyticsService = new HybridAnalyticsService();
export type { RealTimeMetrics, BenchmarkData, AnalyticsSnapshot };