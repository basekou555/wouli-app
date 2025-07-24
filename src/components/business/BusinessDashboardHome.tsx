import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBusinessAnalytics } from '@/contexts/BusinessAnalyticsContext';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { Alert } from '@/data/simulatedAnalytics';

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-primary" />;
    }
  };

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'border-destructive/20 bg-destructive/5';
      case 'positive': return 'border-green-200 bg-green-50';
      case 'opportunity': return 'border-primary/20 bg-primary/5';
    }
  };

  return (
    <Card className={`${getAlertBg(alert.type)} border-l-4`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {getAlertIcon(alert.type)}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground">{alert.title}</p>
            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
            {alert.action && (
              <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                {alert.action}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function BusinessDashboardHome() {
  const { metrics, alerts, events, loading } = useBusinessAnalytics();

  if (loading) {
    return <div className="animate-pulse">Chargement...</div>;
  }

  const topPerformingEvent = events.sort((a, b) => b.performance_score - a.performance_score)[0];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Événements actifs
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.total_events}</div>
            <p className="text-xs text-muted-foreground">
              +2 ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vues totales
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.total_views}</div>
            <p className="text-xs text-green-600">
              +{metrics.growth_7d}% cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participants
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metrics.total_participants}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avg_conversion.toFixed(1)}% taux de conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Position marché
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">#{metrics.market_position}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.best_performing_category}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Alertes & Recommandations</h2>
          <div className="grid gap-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {/* Performance Highlight */}
      {topPerformingEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Meilleure Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">{topPerformingEvent.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {topPerformingEvent.participants} participants • {topPerformingEvent.conversion_rate.toFixed(1)}% conversion
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Score: {topPerformingEvent.performance_score}/10
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Position #{topPerformingEvent.competitor_rank}
                  </Badge>
                </div>
              </div>
              <Button variant="outline">
                Voir détails
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}