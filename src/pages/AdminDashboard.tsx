
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminMenu from '@/components/AdminMenu';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { data: stats } = useAdminStats();
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

  return (
    <div className="min-h-screen bg-background">
      <AdminMenu />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-2">Vue d'ensemble de la plateforme Wouli</p>
        </div>

        {/* Statistiques principales */}
        <div className="mb-8">
          <AdminStatsCards />
        </div>

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
