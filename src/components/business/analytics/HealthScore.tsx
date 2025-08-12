import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface HealthScoreProps {
  score: number;
  className?: string;
  details?: {
    visibility: number;
    engagement: number;
    conversion: number;
    timing: number;
  };
}

const HealthScore: React.FC<HealthScoreProps> = ({ 
  score, 
  className = '',
  details 
}) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = () => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'À améliorer';
  };

  const getBadgeVariant = () => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Score de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          {getScoreIcon()}
          <div className={`text-3xl font-bold ${getScoreColor()}`}>
            {score}/100
          </div>
        </div>
        
        <Badge variant={getBadgeVariant()} className="text-sm">
          {getScoreLabel()}
        </Badge>

        {details && (
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Visibilité:</span>
              <span className="font-medium">{details.visibility}/25</span>
            </div>
            <div className="flex justify-between">
              <span>Engagement:</span>
              <span className="font-medium">{details.engagement}/25</span>
            </div>
            <div className="flex justify-between">
              <span>Conversion:</span>
              <span className="font-medium">{details.conversion}/25</span>
            </div>
            <div className="flex justify-between">
              <span>Timing:</span>
              <span className="font-medium">{details.timing}/25</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthScore;