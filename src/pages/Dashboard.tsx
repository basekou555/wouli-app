
import React from 'react';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Exemples d'événements
const upcomingEvents = [
  {
    id: '1',
    title: 'Afterwork au Café des Artistes',
    date: '2024-05-15T18:00:00',
    location: 'Café des Artistes, Paris',
    participants: 8,
    image: 'https://picsum.photos/400/200?random=1'
  },
  {
    id: '2',
    title: 'Brunch dimanche',
    date: '2024-05-12T11:00:00',
    location: 'Chez Paul, Lyon',
    participants: 4,
    image: 'https://picsum.photos/400/200?random=2'
  }
];

const friendsEvents = [
  {
    id: '3',
    title: 'Concert Jazz',
    date: '2024-05-20T20:00:00',
    location: 'Jazz Club, Marseille',
    organizer: 'Sophie L.',
    participants: 12,
    image: 'https://picsum.photos/400/200?random=3'
  },
  {
    id: '4',
    title: 'Dégustation de vins',
    date: '2024-05-25T19:00:00',
    location: 'Cave à vins, Bordeaux',
    organizer: 'Thomas M.',
    participants: 6,
    image: 'https://picsum.photos/400/200?random=4'
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

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-8 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <Link
            to="/events/create"
            className="inline-flex items-center rounded-full bg-wouli-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer un événement
          </Link>
        </div>

        {/* Événements à venir */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Vos prochains événements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="block group">
                <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.participants} participants</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
            <Link to="/events/create" className="block h-full">
              <Card className="h-full border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 transition-colors hover:bg-gray-100">
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-wouli-blue" />
                </div>
                <p className="text-center text-gray-600 font-medium">Créer un nouvel événement</p>
                <p className="text-center text-gray-500 text-sm mt-2">Organisez une sortie en quelques clics</p>
              </Card>
            </Link>
          </div>
        </section>

        {/* Événements des amis */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ce que vos amis organisent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friendsEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="block group">
                <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md">
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>Organisé par {event.organizer}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.participants} participants</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
