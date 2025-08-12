import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Sparkline from './Sparkline';
import ProgressBar from './ProgressBar';

interface MetricCardProps {
  value: number | string;
  label: string;
  trend?: string;
  benchmark?: string;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
  sparkline?: number[];
  subtitle?: string;
  fillRate?: number;
  capacity?: number;
  badge?: string;
  status?: 'excellent' | 'good' | 'average' | 'poor';
}

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  trend,
  benchmark,
  color = 'hsl(var(--primary))',
  icon,
  className = '',
  sparkline,
  subtitle,
  fillRate,
  capacity,
  badge,
  status
}) => {
  const getTrendIcon = (trendValue: string) => {
    if (trendValue.startsWith('+')) {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (trendValue.startsWith('-')) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    }
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getTrendColor = (trendValue: string) => {
    if (trendValue.startsWith('+')) return 'text-success';
    if (trendValue.startsWith('-')) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'excellent': return 'from-success to-success/70';
      case 'good': return 'from-primary to-primary/70';
      case 'average': return 'from-accent to-accent/70';
      case 'poor': return 'from-destructive to-destructive/70';
      default: return 'from-primary to-primary/70';
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${className}`}>
      {badge && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs">
            {badge}
          </Badge>
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon && (
          <div className={`p-2 rounded-lg ${status ? `bg-gradient-to-br ${getStatusColor(status)} text-white` : ''}`} style={!status ? { color } : {}}>
            {icon}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="text-3xl font-bold" style={{ color }}>
            {typeof value === 'number' && value >= 1000 
              ? `${(value / 1000).toFixed(1)}k` 
              : value
            }
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              <span className="font-medium">{trend}%</span>
            </div>
          )}
          
          {benchmark && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {benchmark}
            </Badge>
          )}
        </div>

        {sparkline && (
          <Sparkline data={sparkline} className="h-6 mt-2" color={color} />
        )}
        
        {(fillRate !== undefined && capacity !== undefined) && (
          <ProgressBar 
            value={fillRate} 
            max={100} 
            label="Remplissage" 
            color={status ? getStatusColor(status) : 'from-primary to-accent'}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;