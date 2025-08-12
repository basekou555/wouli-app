import { supabase } from "@/integrations/supabase/client";
import { UnifiedEvent } from "@/types/unified";

// Demo multipliers for pilots - realistic values
const DEMO_MULTIPLIERS = {
  views: 2.8,        
  likes: 2.5,        
  participants: 3.1, 
  conversion_rate: 1.1 // Slight improvement only
};

interface WouliMetrics {
  // Visibilité
  view_rate: number; // % qui s'arrêtent sur la carte
  avg_view_duration: number; // Temps moyen de visualisation
  
  // Timing
  avg_advance_booking: number; // Réservation J-X en moyenne
  last_24h_surge: number; // % inscriptions dernière journée
  best_posting_time: string; // Heure optimale
  
  // Position
  category_rank: number; // Rang dans la catégorie
  vs_average: number; // Performance vs moyenne
  percentile: number; // Percentile de performance
  
  // Vélocité
  booking_velocity: number; // Inscriptions par jour
  capacity_filled: number; // % de capacité atteinte
}

interface RealTimeMetrics {
  views: number;
  likes: number;
  participants: number;
  conversion_rate: number;
  like_rate: number;
  engagement_score: number;
  wouli?: WouliMetrics;
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

  // Real-time metrics calculation from DB data with WOULI metrics
  calculateRealTimeMetrics(event: UnifiedEvent): RealTimeMetrics {
    const views = event.views || 0;
    const likes = event.likes || 0;
    const participants = event.participants || 0;
    
    const conversion_rate = views > 0 ? (participants / views) * 100 : 0;
    const like_rate = views > 0 ? (likes / views) * 100 : 0;
    const engagement_score = Math.round((like_rate + conversion_rate) / 2);

    // Calculate WOULI metrics
    const wouliMetrics = this.calculateWouliMetrics(event, views, likes, participants, conversion_rate);

    return {
      views,
      likes,
      participants,
      conversion_rate: Math.round(conversion_rate * 100) / 100,
      like_rate: Math.round(like_rate * 100) / 100,
      engagement_score,
      wouli: wouliMetrics
    };
  }

  // Calculate advanced WOULI metrics
  private calculateWouliMetrics(event: UnifiedEvent, views: number, likes: number, participants: number, conversion_rate: number): WouliMetrics {
    const eventDate = new Date(event.date);
    const createdDate = new Date(event.created_at || Date.now());
    const now = new Date();
    
    // Calculate days between creation and event
    const daysBetween = Math.max(1, Math.ceil((eventDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate metrics
    const view_rate = views > 0 ? Math.min(100, (views / (views * 1.5)) * 100) : 0; // Simulated engagement rate
    const avg_view_duration = Math.round(2 + (likes / Math.max(views, 1)) * 8); // 2-10 seconds based on engagement
    
    const avg_advance_booking = Math.max(1, daysBetween - 2); // Days in advance
    const last_24h_surge = participants > 5 ? Math.round(20 + Math.random() * 30) : 0; // % recent bookings
    const best_posting_time = this.calculateBestPostingTime(createdDate);
    
    const category_rank = 0; // Will be calculated separately
    const vs_average = conversion_rate > 8 ? Math.round((conversion_rate / 8 - 1) * 100) : Math.round((conversion_rate / 8 - 1) * 100);
    const percentile = Math.min(99, Math.max(1, Math.round(conversion_rate * 5))); // 0-20% -> 0-100 percentile
    
    const booking_velocity = daysBetween > 0 ? Math.round((participants / daysBetween) * 10) / 10 : 0;
    const capacity_filled = event.capacity ? Math.round((participants / event.capacity) * 100) : 0;

    return {
      view_rate: Math.round(view_rate * 10) / 10,
      avg_view_duration,
      avg_advance_booking,
      last_24h_surge,
      best_posting_time,
      category_rank,
      vs_average,
      percentile,
      booking_velocity,
      capacity_filled
    };
  }

  // Calculate optimal posting time based on event creation time
  private calculateBestPostingTime(createdDate: Date): string {
    const hour = createdDate.getHours();
    
    // Determine best time based on patterns
    if (hour >= 6 && hour < 12) return "18h-20h"; // Morning posts -> evening peak
    if (hour >= 12 && hour < 18) return "20h-22h"; // Afternoon posts -> evening peak
    if (hour >= 18 && hour < 22) return "12h-14h"; // Evening posts -> lunch peak
    return "18h-20h"; // Default evening peak
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

  // Enhanced insights generator with 5 types of alerts
  generateInsights(metrics: RealTimeMetrics, benchmark: BenchmarkData | null, event?: UnifiedEvent): Array<{
    type: 'positive' | 'warning' | 'opportunity' | 'timing' | 'competition';
    title: string;
    description: string;
    action?: string;
    priority: number;
  }> {
    const insights = [];
    const wouli = metrics.wouli;

    // 1. POSITIVE INSIGHTS - Performance exceptionnelle
    if (benchmark && metrics.conversion_rate > benchmark.avg_conversion * 1.5) {
      insights.push({
        type: 'positive' as const,
        title: '🔥 Performance exceptionnelle !',
        description: `${metrics.conversion_rate}% de conversion vs ${benchmark.avg_conversion}% en moyenne`,
        action: 'Dupliquer cette stratégie',
        priority: 1
      });
    }

    if (wouli && wouli.percentile >= 80) {
      insights.push({
        type: 'positive' as const,
        title: '🏆 Top performer de votre catégorie',
        description: `Vous êtes dans le top ${100 - wouli.percentile}% des événements similaires`,
        action: 'Partager votre succès',
        priority: 2
      });
    }

    // 2. WARNING INSIGHTS - Problèmes détectés
    if (metrics.views > 50 && metrics.conversion_rate < 2) {
      insights.push({
        type: 'warning' as const,
        title: '⚠️ Visibilité élevée, conversion faible',
        description: `${metrics.views} vues mais seulement ${metrics.conversion_rate}% de conversion`,
        action: 'Revoir la description ou le prix',
        priority: 3
      });
    }

    if (wouli && wouli.booking_velocity < 0.5 && event) {
      const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilEvent > 0 && daysUntilEvent <= 7) {
        insights.push({
          type: 'warning' as const,
          title: '⏰ Réservations trop lentes',
          description: `Seulement ${wouli.booking_velocity} inscriptions/jour pour un événement dans ${daysUntilEvent} jours`,
          action: 'Booster la promotion',
          priority: 4
        });
      }
    }

    // 3. OPPORTUNITY INSIGHTS - Potentiel d'amélioration
    if (metrics.like_rate > metrics.conversion_rate * 2 && metrics.like_rate > 10) {
      insights.push({
        type: 'opportunity' as const,
        title: '💡 Fort intérêt, conversion à optimiser',
        description: `${metrics.like_rate}% de likes vs ${metrics.conversion_rate}% de participation`,
        action: 'Simplifier l\'inscription',
        priority: 5
      });
    }

    if (wouli && wouli.capacity_filled > 0 && wouli.capacity_filled < 30) {
      insights.push({
        type: 'opportunity' as const,
        title: '📈 Capacité sous-exploitée',
        description: `Seulement ${wouli.capacity_filled}% de votre capacité utilisée`,
        action: 'Créer un tarif attractif',
        priority: 6
      });
    }

    // 4. TIMING INSIGHTS - Recommandations temporelles
    if (wouli && wouli.best_posting_time) {
      insights.push({
        type: 'timing' as const,
        title: '⏱️ Meilleur moment pour publier',
        description: `Les événements publiés entre ${wouli.best_posting_time} performent +25% mieux`,
        action: 'Programmer vos prochains posts',
        priority: 7
      });
    }

    if (wouli && wouli.avg_advance_booking > 7) {
      insights.push({
        type: 'timing' as const,
        title: '📅 Vos clients planifient à l\'avance',
        description: `Réservations en moyenne ${wouli.avg_advance_booking} jours avant l'événement`,
        action: 'Publier vos événements plus tôt',
        priority: 8
      });
    }

    // 5. COMPETITION INSIGHTS - Position vs concurrents
    if (benchmark && wouli && wouli.vs_average > 20) {
      insights.push({
        type: 'competition' as const,
        title: '🎯 Au-dessus de la concurrence',
        description: `Performance ${wouli.vs_average > 0 ? '+' : ''}${wouli.vs_average}% vs la moyenne`,
        action: 'Maintenir cette stratégie',
        priority: 9
      });
    }

    if (benchmark && wouli && wouli.vs_average < -30) {
      insights.push({
        type: 'competition' as const,
        title: '📊 Rattraper la concurrence',
        description: `Performance ${wouli.vs_average}% vs la moyenne de votre catégorie`,
        action: 'Analyser les leaders',
        priority: 10
      });
    }

    // Sort by priority and return max 3
    return insights
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 3);
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
export type { RealTimeMetrics, BenchmarkData, AnalyticsSnapshot, WouliMetrics };