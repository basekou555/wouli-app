import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { WouliMetrics } from "@/services/hybridAnalyticsService";
import { 
  Eye, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Target, 
  Timer,
  Trophy,
  Zap
} from 'lucide-react';

interface WouliMetricsGridProps {
  metrics: WouliMetrics;
  className?: string;
}

const WouliMetricsGrid: React.FC<WouliMetricsGridProps> = ({
  metrics,
  className = ''
}) => {
  const getPerformanceBadge = (percentile: number) => {
    if (percentile >= 90) return { variant: "default" as const, text: "Excellent", color: "text-success" };
    if (percentile >= 70) return { variant: "secondary" as const, text: "Très bon", color: "text-success" };
    if (percentile >= 50) return { variant: "outline" as const, text: "Bon", color: "text-warning" };
    return { variant: "destructive" as const, text: "À améliorer", color: "text-destructive" };
  };

  const performanceBadge = getPerformanceBadge(metrics.percentile);

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Visibilité */}
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Taux d'engagement</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.view_rate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            {metrics.view_rate}%
          </div>
          <p className="text-xs text-muted-foreground">
            s'arrêtent sur votre carte
          </p>
          <Progress value={metrics.view_rate} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* Durée d'attention */}
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm">Temps d'attention</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.avg_view_duration}s
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            {metrics.avg_view_duration}s
          </div>
          <p className="text-xs text-muted-foreground">
            temps moyen de visualisation
          </p>
          <div className="mt-2 flex items-center gap-1">
            <div className="h-1 bg-accent/20 rounded-full flex-1 overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${Math.min(100, (metrics.avg_view_duration / 10) * 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vélocité de réservation */}
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              <CardTitle className="text-sm">Vélocité</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.booking_velocity}/j
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            {metrics.booking_velocity}
          </div>
          <p className="text-xs text-muted-foreground">
            inscriptions par jour
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-success">+12% vs hier</span>
          </div>
        </CardContent>
      </Card>

      {/* Position concurrentielle */}
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Position</CardTitle>
            </div>
            <Badge variant={performanceBadge.variant} className="text-xs">
              {performanceBadge.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-1">
            Top {100 - metrics.percentile}%
          </div>
          <p className="text-xs text-muted-foreground">
            de votre catégorie
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span className={`${performanceBadge.color} flex items-center gap-1`}>
              {metrics.vs_average > 0 ? '+' : ''}{metrics.vs_average}% vs moyenne
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Timing insights - Span 2 columns */}
      <Card className="col-span-2 group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-accent" />
              <CardTitle className="text-sm">Insights Timing</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {metrics.best_posting_time}
              </div>
              <p className="text-xs text-muted-foreground">
                Meilleur moment pour publier
              </p>
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground mb-1">
                J-{metrics.avg_advance_booking}
              </div>
              <p className="text-xs text-muted-foreground">
                Réservation moyenne à l'avance
              </p>
            </div>
          </div>
          
          {metrics.last_24h_surge > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success font-medium">
                  {metrics.last_24h_surge}% des inscriptions en dernière minute
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacité - Span 2 columns */}
      <Card className="col-span-2 group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Taux de remplissage</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {metrics.capacity_filled}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground mb-2">
            {metrics.capacity_filled}%
          </div>
          <Progress value={metrics.capacity_filled} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            de votre capacité maximale atteinte
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WouliMetricsGrid;