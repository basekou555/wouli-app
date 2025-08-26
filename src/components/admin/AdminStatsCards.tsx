
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, BarChart3, Shield, Clock } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Skeleton } from '@/components/ui/skeleton';

const AdminStatsCards = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Utilisateurs Totaux",
      value: stats?.totalUsers || 0,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      trend: "+12% par rapport au mois dernier"
    },
    {
      title: "Événements Actifs", 
      value: stats?.activeEvents || 0,
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      trend: stats?.weeklyGrowth ? `${stats.weeklyGrowth > 0 ? '+' : ''}${stats.weeklyGrowth}% cette semaine` : "Stable"
    },
    {
      title: "Établissements",
      value: stats?.businessCount || 0,
      icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
      trend: "+3 nouveaux ce mois"
    },
    {
      title: "En Attente",
      value: stats?.pendingEvents || 0,
      icon: <Clock className="h-4 w-4 text-orange-500" />,
      trend: stats?.pendingEvents ? "À valider" : "Aucune validation en attente",
      urgent: (stats?.pendingEvents || 0) > 0
    },
    {
      title: "Sécurité",
      value: `${stats?.systemHealth || 99.9}%`,
      icon: <Shield className="h-4 w-4 text-muted-foreground" />,
      trend: "Disponibilité système"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className={card.urgent ? "border-orange-200 bg-orange-50/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className={`text-xs ${card.urgent ? 'text-orange-600' : 'text-muted-foreground'}`}>
              {card.trend}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStatsCards;
