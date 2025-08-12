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
    <Card className={`transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Score de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {/* Score principal avec animation */}
        <div className="relative">
          <div className="flex items-center justify-center space-x-3">
            <div className="transition-transform duration-300 hover:scale-110">
              {getScoreIcon()}
            </div>
            <div className={`text-4xl font-bold transition-colors duration-300 ${getScoreColor()}`}>
              {score}
              <span className="text-lg text-muted-foreground">/100</span>
            </div>
          </div>
          
          {/* Barre de progression circulaire simulée */}
          <div className="mt-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r transition-all duration-1000 ease-out ${
                  score >= 80 ? 'from-green-400 to-green-600' : 
                  score >= 60 ? 'from-yellow-400 to-yellow-600' : 
                  'from-red-400 to-red-600'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
        
        <Badge variant={getBadgeVariant()} className="text-sm font-medium px-3 py-1">
          {getScoreLabel()}
        </Badge>

        {details && (
          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs text-muted-foreground font-medium">Détail par catégorie</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg transition-colors hover:bg-muted/50">
                <span className="text-muted-foreground">Visibilité</span>
                <span className="font-bold text-foreground">{details.visibility}/25</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg transition-colors hover:bg-muted/50">
                <span className="text-muted-foreground">Engagement</span>
                <span className="font-bold text-foreground">{details.engagement}/25</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg transition-colors hover:bg-muted/50">
                <span className="text-muted-foreground">Conversion</span>
                <span className="font-bold text-foreground">{details.conversion}/25</span>
              </div>
              <div className="flex flex-col items-center p-2 bg-muted/30 rounded-lg transition-colors hover:bg-muted/50">
                <span className="text-muted-foreground">Timing</span>
                <span className="font-bold text-foreground">{details.timing}/25</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthScore;