// Simulated analytics data based on realistic patterns
export interface SimulatedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  views: number;
  likes: number;
  participants: number;
  performance_score: number;
  trend_7d: number; // percentage change vs last 7 days
  conversion_rate: number; // participants/views ratio
  competitor_rank: number; // 1-5 position vs competitors
}

export interface Alert {
  id: string;
  type: 'critical' | 'positive' | 'opportunity';
  title: string;
  description: string;
  action?: string;
  event_id?: string;
  priority: number;
}

export interface Benchmark {
  category: string;
  avg_views: number;
  avg_participants: number;
  avg_conversion: number;
  top_performer: number;
}

// Realistic simulated data based on current business events patterns
export const simulatedEvents: SimulatedEvent[] = [
  {
    id: "1",
    title: "Soirée Blind Test années 90",
    date: "2024-01-28",
    time: "20:00",
    category: "soirees",
    views: 127,
    likes: 18,
    participants: 15,
    performance_score: 8.2,
    trend_7d: 45,
    conversion_rate: 11.8,
    competitor_rank: 2
  },
  {
    id: "2", 
    title: "Dégustation whisky",
    date: "2024-01-30",
    time: "19:30",
    category: "a-boire",
    views: 89,
    likes: 12,
    participants: 8,
    performance_score: 6.5,
    trend_7d: -12,
    conversion_rate: 9.0,
    competitor_rank: 4
  },
  {
    id: "3",
    title: "Menu spécial Saint-Valentin", 
    date: "2024-02-14",
    time: "19:00",
    category: "a-manger",
    views: 203,
    likes: 34,
    participants: 28,
    performance_score: 9.1,
    trend_7d: 78,
    conversion_rate: 13.8,
    competitor_rank: 1
  },
  {
    id: "4",
    title: "Atelier cocktails",
    date: "2024-02-02",
    time: "18:30", 
    category: "activites",
    views: 67,
    likes: 8,
    participants: 4,
    performance_score: 4.2,
    trend_7d: -25,
    conversion_rate: 6.0,
    competitor_rank: 5
  }
];

// Alert thresholds and logic
export const alertThresholds = {
  critical: {
    lowViews: 30,
    lowParticipants: 5,
    lowConversion: 5.0
  },
  positive: {
    highEngagement: 15.0,
    trending: 50,
    topRank: 2
  },
  opportunity: {
    emptySlot: true,
    recurringDue: true,
    competitorGap: 3
  }
};

// Generate contextual alerts based on events data
export const generateAlerts = (events: SimulatedEvent[]): Alert[] => {
  const alerts: Alert[] = [];
  
  events.forEach(event => {
    // Critical alerts
    if (event.views < alertThresholds.critical.lowViews) {
      alerts.push({
        id: `critical-${event.id}-views`,
        type: 'critical',
        title: 'Faible visibilité',
        description: `"${event.title}" n'a que ${event.views} vues. Boostez la communication !`,
        action: 'Partager sur réseaux sociaux',
        event_id: event.id,
        priority: 1
      });
    }

    if (event.participants < alertThresholds.critical.lowParticipants) {
      alerts.push({
        id: `critical-${event.id}-participants`,
        type: 'critical', 
        title: 'Peu de participants',
        description: `Seulement ${event.participants} participants pour "${event.title}"`,
        action: 'Relancer la promotion',
        event_id: event.id,
        priority: 1
      });
    }

    // Positive alerts
    if (event.conversion_rate > alertThresholds.positive.highEngagement) {
      alerts.push({
        id: `positive-${event.id}-conversion`,
        type: 'positive',
        title: 'Excellent taux de conversion !',
        description: `"${event.title}" convertit à ${event.conversion_rate.toFixed(1)}%`,
        action: 'Dupliquer cet événement',
        event_id: event.id,
        priority: 2
      });
    }

    if (event.trend_7d > alertThresholds.positive.trending) {
      alerts.push({
        id: `positive-${event.id}-trending`,
        type: 'positive',
        title: 'Événement en tendance !',
        description: `+${event.trend_7d}% d'engagement sur 7 jours`,
        event_id: event.id,
        priority: 2
      });
    }

    // Opportunity alerts
    if (event.competitor_rank >= alertThresholds.opportunity.competitorGap) {
      alerts.push({
        id: `opportunity-${event.id}-rank`,
        type: 'opportunity',
        title: 'Potentiel d\'amélioration',
        description: `Position #${event.competitor_rank} - marge de progression`,
        action: 'Analyser la concurrence',
        event_id: event.id,
        priority: 3
      });
    }
  });

  // Sort by priority and return max 3 alerts
  return alerts
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3);
};

// Benchmark data for performance comparison
export const benchmarks: Record<string, Benchmark> = {
  "a-boire": {
    category: "a-boire",
    avg_views: 95,
    avg_participants: 12,
    avg_conversion: 12.6,
    top_performer: 15.8
  },
  "a-manger": {
    category: "a-manger", 
    avg_views: 156,
    avg_participants: 18,
    avg_conversion: 11.5,
    top_performer: 16.2
  },
  "soirees": {
    category: "soirees",
    avg_views: 118,
    avg_participants: 15,
    avg_conversion: 12.7,
    top_performer: 18.5
  },
  "activites": {
    category: "activites",
    avg_views: 87,
    avg_participants: 10,
    avg_conversion: 11.5,
    top_performer: 15.0
  }
};

// Overall business metrics
export const businessMetrics = {
  total_events: simulatedEvents.length,
  total_views: simulatedEvents.reduce((sum, e) => sum + e.views, 0),
  total_participants: simulatedEvents.reduce((sum, e) => sum + e.participants, 0),
  avg_conversion: simulatedEvents.reduce((sum, e) => sum + e.conversion_rate, 0) / simulatedEvents.length,
  best_performing_category: "a-manger",
  growth_7d: 23.5,
  market_position: 2
};