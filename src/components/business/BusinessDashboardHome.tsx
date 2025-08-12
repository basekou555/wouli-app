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
  ArrowRight,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react';
import { Alert } from '@/data/simulatedAnalytics';
import HealthScore from './analytics/HealthScore';
import MetricsGrid from './analytics/MetricsGrid';
import TopEventsGrid from './analytics/TopEventsGrid';
import FunnelChart from './analytics/FunnelChart';
import LoadingSpinner from '@/components/LoadingSpinner';

const AlertCard: React.FC<{ alert: Alert; index: number }> = ({ alert, index }) => {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-primary" />;
    }
  };

  const getAlertBg = (type: Alert['type']) => {
    switch (type) {
      case 'critical': return 'border-destructive/20 bg-destructive/5 hover:bg-destructive/10';
      case 'positive': return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'opportunity': return 'border-primary/20 bg-primary/5 hover:bg-primary/10';
    }
  };

  return (
    <Card 
      className={`${getAlertBg(alert.type)} border-l-4 transition-all duration-300 hover:shadow-md animate-fade-in cursor-pointer`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            {getAlertIcon(alert.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground">{alert.title}</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>
            {alert.action && (
              <Button variant="outline" size="sm" className="mt-3 h-8 text-xs hover-scale">
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <LoadingSpinner size="lg" text="Chargement de votre dashboard..." />
      </div>
    );
  }

  const handleEventClick = (eventId: string) => {
    navigate(`/business/events/${eventId}`);
  };

  const handleCreateEvent = () => {
    navigate('/business/events/new');
  };

  // Créer les données pour le funnel
  const funnelData = metrics ? [
    { name: 'Vues', value: metrics.totalViews, color: 'hsl(var(--primary))' },
    { name: 'Likes', value: metrics.totalLikes, color: 'hsl(var(--secondary))' },
    { name: 'Participants', value: metrics.totalParticipants, color: 'hsl(var(--accent))' }
  ] : [];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de vos performances et événements
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/business/analytics')}
            className="hover-scale"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button 
            onClick={handleCreateEvent}
            className="hover-scale bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      {/* Première ligne - Score de performance et détails */}
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        {metrics && (
          <HealthScore 
            score={metrics.healthScore} 
            details={metrics.healthDetails}
            className="transition-all duration-300 hover:shadow-lg max-w-md mx-auto"
          />
        )}
      </div>

      {/* Deuxième ligne - Métriques principales */}
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        {metrics && (
          <MetricsGrid 
            metrics={metrics} 
            className="animate-fade-in"
          />
        )}
      </div>

      {/* Alertes & Recommandations */}
      {alerts.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Alertes & Recommandations</h2>
            <Badge variant="secondary" className="ml-2">
              {alerts.length}
            </Badge>
          </div>
          <div className="grid gap-4">
            {alerts.map((alert, index) => (
              <AlertCard key={alert.id} alert={alert} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Analytics détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
        <div className="transition-all duration-300 hover:scale-[1.02]">
          <FunnelChart 
            stages={funnelData}
            title="Entonnoir de conversion"
            className="h-full"
          />
        </div>
        
        <div className="transition-all duration-300 hover:scale-[1.02]">
          <TopEventsGrid 
            events={events || []}
            title="Top événements"
            onEventClick={handleEventClick}
            className="h-full"
          />
        </div>
      </div>

      {/* Section vide avec CTA si pas d'événements */}
      {(!events || events.length === 0) && (
        <Card className="border-dashed border-2 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun événement créé
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Commencez par créer votre premier événement pour voir apparaître vos statistiques et performances.
            </p>
            <Button 
              onClick={handleCreateEvent}
              className="hover-scale bg-gradient-to-r from-primary to-primary/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier événement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}