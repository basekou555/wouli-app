import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Heart, X, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';

// Mock data pour l'historique - en production, cela viendrait du localStorage ou d'une base de données
const mockLikedEvents = [
  {
    id: '1',
    title: 'Concert Jazz au Sunset',
    date: '2024-06-15T20:00:00',
    location: 'Sunset Jazz Club, Paris',
    image: 'https://picsum.photos/400/200?random=1',
    participants: 45
  },
  {
    id: '2', 
    title: 'Atelier Cuisine Italienne',
    date: '2024-06-20T18:30:00',
    location: 'École de Cuisine, Lyon',
    image: 'https://picsum.photos/400/200?random=2',
    participants: 12
  }
];

const mockParticipatingEvents = [
  {
    id: '3',
    title: 'Afterwork Startup',
    date: '2024-06-10T18:00:00',
    location: 'La Défense, Paris',
    image: 'https://picsum.photos/400/200?random=3',
    participants: 28
  },
  {
    id: '4',
    title: 'Randonnée Mont Blanc',
    date: '2024-06-25T08:00:00',
    location: 'Chamonix',
    image: 'https://picsum.photos/400/200?random=4',
    participants: 8
  }
];

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
  const [likedEvents, setLikedEvents] = useState(mockLikedEvents);
  const [participatingEvents, setParticipatingEvents] = useState(mockParticipatingEvents);
  const { toast } = useToast();

  const removeLikedEvent = (eventId: string) => {
    setLikedEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Retiré des favoris",
      description: "L'événement a été retiré de vos favoris",
    });
  };

  const removeParticipation = (eventId: string) => {
    setParticipatingEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Participation annulée",
      description: "Votre participation a été annulée",
    });
  };

  const EventCard = ({ event, onRemove, removeText, removeIcon }: any) => (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <img
          src={event.image}
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
            {event.participants} participants
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AppLayout>
        <div className="py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Événements</h1>
            <p className="text-gray-500">Gérez vos favoris et participations</p>
          </div>

          <Tabs defaultValue="liked" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="liked" className="flex items-center">
                <Heart className="h-4 w-4 mr-2" />
                Favoris ({likedEvents.length})
              </TabsTrigger>
              <TabsTrigger value="participating" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Participations ({participatingEvents.length})
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
          </Tabs>
        </div>
      </AppLayout>
      <BottomNavigation />
    </div>
  );
};

export default UserHistory;
