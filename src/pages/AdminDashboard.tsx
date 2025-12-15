
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AdminMenu from '@/components/AdminMenu';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, AlertTriangle, Edit, Instagram, 
  CheckCircle, XCircle, Zap, TrendingUp, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { data: stats, isLoading, refetch } = useAdminStats();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Valider les événements",
      description: stats?.pendingEvents ? `${stats.pendingEvents} événement(s) en attente` : "Aucune validation en attente",
      action: () => navigate('/admin/validation'),
      urgent: (stats?.pendingEvents || 0) > 0,
      badge: stats?.pendingEvents || 0
    },
    {
      title: "Contrôle Scraper",
      description: "Lancer et monitorer le scraper Instagram",
      action: () => navigate('/admin/scraper'),
      urgent: false,
      badge: null
    },
    {
      title: "Gérer les utilisateurs",
      description: `${stats?.totalUsers || 0} utilisateurs inscrits`,
      action: null,
      urgent: false,
      badge: null,
      disabled: true
    },
    {
      title: "Analytics globales",
      description: `${stats?.activeEvents || 0} événements actifs`,
      action: null,
      urgent: false,
      badge: null,
      disabled: true
    }
  ];

  const hasAlerts = (stats?.manualReviewEvents || 0) > 0 || 
                    (stats?.scraperErrorsCount || 0) > 0 || 
                    (stats?.problematicAccounts?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-background">
      <AdminMenu />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-muted-foreground mt-2">Vue d'ensemble de la plateforme Wouli</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Section Alertes Prioritaires */}
        {hasAlerts && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-bold text-orange-900">
                🚨 Alertes Prioritaires
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Alerte Manual Review */}
              {(stats?.manualReviewEvents || 0) > 0 && (
                <div 
                  className="bg-white border border-orange-300 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/admin/validation')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{stats?.manualReviewEvents}</p>
                      <p className="text-sm text-muted-foreground">Programme(s) à réviser</p>
                    </div>
                    <Edit className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-xs text-orange-700 mt-2">
                    ⚠️ Nécessite traitement manuel
                  </p>
                </div>
              )}

              {/* Alerte Erreurs */}
              {(stats?.scraperErrorsCount || 0) > 0 && (
                <div 
                  className="bg-white border border-red-300 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/admin/validation')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-red-600">{stats?.scraperErrorsCount}</p>
                      <p className="text-sm text-muted-foreground">Événement(s) perdu(s)</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-xs text-red-700 mt-2">
                    ❌ Erreurs de sauvegarde scraper
                  </p>
                </div>
              )}

              {/* Alerte Comptes Problématiques */}
              {(stats?.problematicAccounts?.length || 0) > 0 && (
                <div 
                  className="bg-white border border-yellow-300 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/admin/scraper')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">{stats?.problematicAccounts?.length}</p>
                      <p className="text-sm text-muted-foreground">Compte(s) inactif(s)</p>
                    </div>
                    <Instagram className="w-8 h-8 text-yellow-500" />
                  </div>
                  <p className="text-xs text-yellow-700 mt-2">
                    🔍 Nécessite vérification
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistiques principales */}
        <div className="mb-8">
          <AdminStatsCards />
        </div>

        {/* Métriques avancées */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Taux de validation */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Taux de validation</p>
                  <p className="text-3xl font-bold text-green-600">
                    {(stats?.validationRate || 0).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats?.activeEvents || 0} validés
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Taux de rejet */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Taux de rejet</p>
                  <p className="text-3xl font-bold text-red-600">
                    {(stats?.rejectionRate || 0).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sur événements traités
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Croissance hebdo */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Croissance hebdo</p>
                  <p className={`text-3xl font-bold ${(stats?.weeklyGrowth || 0) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                    {(stats?.weeklyGrowth || 0) > 0 ? '+' : ''}{stats?.weeklyGrowth || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    vs semaine dernière
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline 7 derniers jours */}
        {stats?.timelineData && stats.timelineData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Timeline - 7 derniers jours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.timelineData.map((day, idx) => {
                  const maxValue = Math.max(...stats.timelineData.map(d => d.created), 1);
                  const createdWidth = (day.created / maxValue) * 100;
                  const validatedWidth = (day.validated / maxValue) * 100;
                  const rejectedWidth = (day.rejected / maxValue) * 100;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium w-20">{day.date}</span>
                        <div className="flex gap-4 text-xs">
                          <span className="text-blue-600">📥 {day.created}</span>
                          <span className="text-green-600">✅ {day.validated}</span>
                          <span className="text-red-600">❌ {day.rejected}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 h-6">
                        <div 
                          className="bg-blue-200 rounded transition-all" 
                          style={{ width: `${createdWidth}%` }}
                          title={`${day.created} créés`}
                        />
                        <div 
                          className="bg-green-200 rounded transition-all" 
                          style={{ width: `${validatedWidth}%` }}
                          title={`${day.validated} validés`}
                        />
                        <div 
                          className="bg-red-200 rounded transition-all" 
                          style={{ width: `${rejectedWidth}%` }}
                          title={`${day.rejected} rejetés`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-200 rounded" />
                  <span>Créés</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-200 rounded" />
                  <span>Validés</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-200 rounded" />
                  <span>Rejetés</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action) => (
                <div 
                  key={action.title}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    action.disabled 
                      ? 'bg-muted cursor-not-allowed opacity-60' 
                      : action.urgent
                        ? 'bg-orange-50 border border-orange-200 cursor-pointer hover:bg-orange-100'
                        : 'bg-muted cursor-pointer hover:bg-muted/80'
                  }`}
                  onClick={action.disabled ? undefined : action.action}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{action.title}</span>
                      {action.badge && action.badge > 0 && (
                        <Badge 
                          variant={action.urgent ? "destructive" : "secondary"}
                          className="ml-2"
                        >
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{action.description}</span>
                  </div>
                  <div className="text-xs">
                    {action.disabled ? (
                      <span className="text-muted-foreground">À venir</span>
                    ) : action.urgent ? (
                      <span className="text-orange-600 font-medium">Urgent</span>
                    ) : (
                      <span className="text-primary hover:underline">Accéder</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Activité récente */}
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;