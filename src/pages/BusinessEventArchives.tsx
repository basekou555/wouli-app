import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArchivedEventCard } from '@/components/business/ArchivedEventCard';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Archive, TrendingUp, Star, Users } from 'lucide-react';
import { BusinessEvent } from '@/types/events';

export const BusinessEventArchives = () => {
  const [archivedEvents, setArchivedEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  useEffect(() => {
    // TODO: Fetch archived events from service
    // For now, using empty array
    setArchivedEvents([]);
    setLoading(false);
  }, [selectedPeriod]);

  const stats = {
    totalEvents: archivedEvents.length,
    totalViews: archivedEvents.reduce((sum, event) => sum + event.views, 0),
    totalParticipants: archivedEvents.reduce((sum, event) => sum + event.participants, 0),
    averageRating: archivedEvents.length > 0 
      ? archivedEvents.reduce((sum, event) => sum + (event.average_rating || 0), 0) / archivedEvents.length 
      : 0
  };

  if (loading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <Archive className="w-6 h-6" />
              <span>Archives des événements</span>
            </h1>
            <p className="text-muted-foreground">
              Retrouvez vos événements passés et leurs performances
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              Conservation: 6 mois
            </Badge>
          </div>
        </div>

        {/* Period Selector */}
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
          <TabsList>
            <TabsTrigger value="week">7 derniers jours</TabsTrigger>
            <TabsTrigger value="month">30 derniers jours</TabsTrigger>
            <TabsTrigger value="quarter">3 derniers mois</TabsTrigger>
            <TabsTrigger value="all">Tout voir</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod} className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Archive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Événements archivés</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.totalEvents}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Vues totales</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.totalViews.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Participants</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{stats.totalParticipants}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Note moyenne</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '--'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Events List */}
            {archivedEvents.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun événement archivé</h3>
                  <p className="text-muted-foreground mb-4">
                    Vos événements apparaîtront ici après leur fin.
                  </p>
                  <Button variant="outline">
                    Créer un nouvel événement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {archivedEvents.map((event) => (
                  <ArchivedEventCard 
                    key={event.id} 
                    event={event}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </BusinessLayout>
  );
};