import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  value: number | string;
  label: string;
  trend?: string;
  benchmark?: string;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  value,
  label,
  trend,
  benchmark,
  color = 'hsl(var(--primary))',
  icon,
  className = ''
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
    if (trendValue.startsWith('+')) return 'text-green-600';
    if (trendValue.startsWith('-')) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon && (
          <div style={{ color }}>
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold" style={{ color }}>
          {typeof value === 'number' && value >= 1000 
            ? `${(value / 1000).toFixed(1)}k` 
            : value
          }
        </div>
        
        <div className="flex items-center justify-between text-xs">
          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              <span className="font-medium">{trend}</span>
            </div>
          )}
          
          {benchmark && (
            <Badge variant="outline" className="text-xs px-2 py-0.5">
              {benchmark}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;