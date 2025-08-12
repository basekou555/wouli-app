import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, Users, TrendingUp, Target } from 'lucide-react';
import MetricCard from './MetricCard';
import BenchmarkBadge from './BenchmarkBadge';
import { RealTimeMetrics, BenchmarkData } from '@/services/hybridAnalyticsService';

interface EventMetricsProps {
  metrics: RealTimeMetrics;
  benchmark?: BenchmarkData | null;
  categoryRank?: { rank: number; total: number } | null;
  className?: string;
}

const EventMetrics: React.FC<EventMetricsProps> = ({
  metrics,
  benchmark,
  categoryRank,
  className = ''
}) => {
  const getMetricCards = () => {
    return [
      {
        value: metrics.views,
        label: 'Vues',
        icon: <Eye className="h-4 w-4" />,
        color: 'hsl(var(--primary))',
        benchmark: benchmark ? `Moy: ${benchmark.avg_views}` : undefined
      },
      {
        value: metrics.likes,
        label: 'Likes',
        icon: <Heart className="h-4 w-4" />,
        color: 'hsl(var(--destructive))',
        trend: metrics.like_rate > 10 ? `+${metrics.like_rate}%` : undefined,
        benchmark: benchmark ? `${metrics.like_rate}% taux` : undefined
      },
      {
        value: metrics.participants,
        label: 'Participants',
        icon: <Users className="h-4 w-4" />,
        color: 'hsl(var(--success))',
        benchmark: benchmark ? `Moy: ${benchmark.avg_participants}` : undefined
      },
      {
        value: `${metrics.conversion_rate}%`,
        label: 'Conversion',
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'hsl(var(--warning))',
        trend: benchmark && metrics.conversion_rate > benchmark.avg_conversion 
          ? `+${Math.round((metrics.conversion_rate - benchmark.avg_conversion) * 100) / 100}%`
          : undefined,
        benchmark: benchmark ? `Moy: ${benchmark.avg_conversion}%` : undefined
      },
      {
        value: metrics.engagement_score,
        label: 'Engagement',
        icon: <Target className="h-4 w-4" />,
        color: 'hsl(var(--secondary))',
        benchmark: `Score /100`
      }
    ];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with benchmark position */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Métriques de performance</h3>
        {categoryRank && (
          <BenchmarkBadge 
            position={categoryRank.rank} 
            total={categoryRank.total}
            category={benchmark?.category}
          />
        )}
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {getMetricCards().map((metric, index) => (
          <MetricCard
            key={index}
            value={metric.value}
            label={metric.label}
            icon={metric.icon}
            color={metric.color}
            trend={metric.trend}
            benchmark={metric.benchmark}
          />
        ))}
      </div>

      {/* Benchmark comparison card */}
      {benchmark && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparaison avec la concurrence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Vues moyennes</div>
                <div className="font-semibold">{benchmark.avg_views}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Participants moyens</div>
                <div className="font-semibold">{benchmark.avg_participants}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Conversion moyenne</div>
                <div className="font-semibold">{benchmark.avg_conversion}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Meilleur performeur</div>
                <div className="font-semibold">{benchmark.top_performer}%</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Basé sur {benchmark.total_events} événements similaires • 
              Mis à jour {new Date(benchmark.cached_at).toLocaleString('fr-FR')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventMetrics;