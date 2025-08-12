import React from 'react';
import MetricCard from './MetricCard';
import { Eye, Heart, Users, TrendingUp } from 'lucide-react';

interface BusinessMetrics {
  totalViews: number;
  totalLikes: number;
  totalParticipants: number;
  conversionRate: number;
  viewsTrend?: string;
  likesTrend?: string;
  participantsTrend?: string;
  conversionTrend?: string;
  benchmarks?: {
    avgViews: number;
    avgLikes: number;
    avgParticipants: number;
    avgConversion: number;
  };
}

interface MetricsGridProps {
  metrics: BusinessMetrics;
  className?: string;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ 
  metrics, 
  className = '' 
}) => {
  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const getBenchmarkText = (current: number, avg: number) => {
    if (!avg) return undefined;
    const diff = ((current - avg) / avg) * 100;
    const sign = diff >= 0 ? '+' : '';
    return `Moy: ${formatValue(avg)} (${sign}${diff.toFixed(0)}%)`;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <MetricCard
        value={formatValue(metrics.totalViews)}
        label="Vues totales"
        trend={metrics.viewsTrend}
        benchmark={metrics.benchmarks ? getBenchmarkText(metrics.totalViews, metrics.benchmarks.avgViews) : undefined}
        status="good"
      />

      <MetricCard
        value={formatValue(metrics.totalLikes)}
        label="Likes totaux"
        trend={metrics.likesTrend}
        benchmark={metrics.benchmarks ? getBenchmarkText(metrics.totalLikes, metrics.benchmarks.avgLikes) : undefined}
        status="good"
      />

      <MetricCard
        value={formatValue(metrics.totalParticipants)}
        label="Participants"
        trend={metrics.participantsTrend}
        benchmark={metrics.benchmarks ? getBenchmarkText(metrics.totalParticipants, metrics.benchmarks.avgParticipants) : undefined}
        status="excellent"
      />

      <MetricCard
        value={`${metrics.conversionRate.toFixed(1)}%`}
        label="Taux de conversion"
        trend={metrics.conversionTrend}
        benchmark={metrics.benchmarks ? `Moy: ${metrics.benchmarks.avgConversion.toFixed(1)}%` : undefined}
        status="average"
      />
    </div>
  );
};

export default MetricsGrid;