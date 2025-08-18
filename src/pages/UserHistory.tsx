
import React from 'react';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Heart, X, Trash2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import { useUserHistory } from '../hooks/useUserHistory';
import { PageSkeleton } from '../components/LoadingSkeleton';
import { UserMemories } from '../components/memories/UserMemories';
import { UnifiedEvent } from '@/types/unified';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const UserHistory = () => {
  const { likedEvents, participatingEvents, loading, removeLikedEvent, removeParticipation } = useUserHistory();

  const EventCard = ({ event, onRemove, removeText, removeIcon }: {
    event: UnifiedEvent;
    onRemove: (eventId: string) => void;
    removeText: string;
    removeIcon: React.ReactNode;
  }) => (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img
          src={event.image_url || `https://picsum.photos/400/200?random=${event.id}`}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={() => onRemove(event.id)}
        >
          {removeIcon}
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            {event.participants || 0} participants
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <Link to={`/event/${event.id}`}>
            <Button variant="outline" size="sm">
              Voir détails
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={() => onRemove(event.id)}>
            {removeText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) return <PageSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppLayout>
        <div className="py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Événements</h1>
            <p className="text-gray-500">Gérez vos favoris, participations et souvenirs</p>
          </div>

          <Tabs defaultValue="liked" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="liked" className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Favoris ({likedEvents.length})
              </TabsTrigger>
              <TabsTrigger value="participating" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Participations ({participatingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="memories" className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Memories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="liked" className="mt-6">
              {likedEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {likedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRemove={removeLikedEvent}
                      removeText="Retirer des favoris"
                      removeIcon={<X className="h-4 w-4" />}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Aucun favori</h3>
                  <p className="text-gray-500 mt-2">Les événements que vous aimez apparaîtront ici</p>
                  <Link to="/app">
                    <Button className="mt-4">Découvrir des événements</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="participating" className="mt-6">
              {participatingEvents.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {participatingEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRemove={removeParticipation}
                      removeText="Annuler participation"
                      removeIcon={<Trash2 className="h-4 w-4" />}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Aucune participation</h3>
                  <p className="text-gray-500 mt-2">Les événements auxquels vous participez apparaîtront ici</p>
                  <Link to="/app">
                    <Button className="mt-4">Rejoindre des événements</Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="memories" className="mt-6">
              <UserMemories />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
      <BottomNavigation />
    </div>
  );
};

export default UserHistory;
