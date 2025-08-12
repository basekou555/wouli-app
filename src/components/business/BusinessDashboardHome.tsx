import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBusinessAnalytics } from '@/contexts/BusinessAnalyticsContext';
import { useBusinessMetrics } from '@/hooks/useBusinessMetrics';
import { useBusinessEvents } from '@/hooks/useBusinessEvents';
import { useNavigate } from 'react-router-dom';
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
import HealthScore from './analytics/HealthScore';
import MetricsGrid from './analytics/MetricsGrid';
import TopEventsGrid from './analytics/TopEventsGrid';
import FunnelChart from './analytics/FunnelChart';

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
  const { alerts } = useBusinessAnalytics();
  const { metrics, loading: metricsLoading } = useBusinessMetrics();
  const { events, loading: eventsLoading } = useBusinessEvents();
  const navigate = useNavigate();

  const loading = metricsLoading || eventsLoading;

  if (loading) {
    return <div className="animate-pulse">Chargement du dashboard...</div>;
  }

  const handleEventClick = (eventId: string) => {
    navigate(`/business/events/${eventId}`);
  };

  // Créer les données pour le funnel
  const funnelData = metrics ? [
    { name: 'Vues', value: metrics.totalViews, color: 'hsl(var(--primary))' },
    { name: 'Likes', value: metrics.totalLikes, color: 'hsl(var(--secondary))' },
    { name: 'Participants', value: metrics.totalParticipants, color: 'hsl(var(--accent))' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Dashboard Header - HealthScore et Métriques principales */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1">
          {metrics && (
            <HealthScore 
              score={metrics.healthScore} 
              details={metrics.healthDetails}
            />
          )}
        </div>
        
        <div className="lg:col-span-4">
          {metrics && (
            <MetricsGrid metrics={metrics} />
          )}
        </div>
      </div>

      {/* Alertes & Recommandations */}
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

      {/* Analytics détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FunnelChart 
          stages={funnelData}
          title="Entonnoir de conversion"
        />
        
        <TopEventsGrid 
          events={events || []}
          title="Top événements"
          onEventClick={handleEventClick}
        />
      </div>
    </div>
  );
}