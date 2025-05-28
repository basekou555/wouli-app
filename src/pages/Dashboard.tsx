
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Plus, Users, Clock3, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Exemples d'événements futurs
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

// Exemples d'événements passés
const pastEvents = [
  {
    id: '5',
    title: 'Randonnée en montagne',
    date: '2024-04-10T09:00:00',
    location: 'Mont Blanc, Chamonix',
    participants: 5,
    image: 'https://picsum.photos/400/200?random=5',
    memories: 12
  },
  {
    id: '6',
    title: 'Soirée jeux de société',
    date: '2024-04-05T19:00:00',
    location: 'Chez Marc, Bordeaux',
    participants: 10,
    image: 'https://picsum.photos/400/200?random=6',
    memories: 8
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

// Souvenirs et rappels
const memories = [
  {
    id: 'm1',
    title: 'Il y a un an - Voyage à Rome',
    description: 'Ce jour-là, vous avez visité le Colisée avec vos amis!',
    date: '2023-05-05T14:00:00',
    image: 'https://picsum.photos/400/200?random=7'
  },
  {
    id: 'm2',
    title: 'Il y a 2 ans - Anniversaire de Julie',
    description: 'Une soirée mémorable pour les 30 ans de Julie',
    date: '2022-05-04T20:00:00',
    image: 'https://picsum.photos/400/200?random=8'
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
  const [feedFilter, setFeedFilter] = useState<'all' | 'future' | 'past'>('all');
  const { toast } = useToast();
  
  const handleMemoryInteraction = (memory: any) => {
    toast({
      title: 'Souvenir partagé',
      description: 'Votre souvenir a été partagé avec vos amis',
    });
  };

  const filteredEvents = () => {
    if (feedFilter === 'future') return [...upcomingEvents, ...friendsEvents];
    if (feedFilter === 'past') return pastEvents;
    // Mix all content for "all" filter
    return [...upcomingEvents, ...pastEvents, ...friendsEvents];
  };

  return (
    <AppLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accueil</h1>
            <p className="text-sm text-gray-500 mt-1">Découvrez ce qui se passe dans votre réseau</p>
          </div>
          <Link
            to="/events/create"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Créer
          </Link>
        </div>

        {/* Feed filters */}
        <div className="border-b border-gray-200">
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFeedFilter(value as 'all' | 'future' | 'past')}>
            <TabsList className="w-full grid grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="all" className="text-sm">Tout</TabsTrigger>
              <TabsTrigger value="future" className="text-sm">À venir</TabsTrigger>
              <TabsTrigger value="past" className="text-sm">Souvenirs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Feed content - Social media style */}
        <div className="space-y-6">
          {filteredEvents().map((event: any, index) => (
            <Card key={event.id} className="overflow-hidden border-gray-100 hover:shadow-sm transition-shadow">
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 p-0.5">
                    <div className="h-full w-full rounded-full bg-white p-0.5">
                      <div className="h-full w-full rounded-full bg-gray-200 overflow-hidden">
                        <img src={`https://picsum.photos/200?random=${event.id}`} alt="Avatar" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{event.organizer || 'Vous'}</p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <Clock3 className="h-4 w-4" />
                </Button>
              </div>

              <Link to={`/events/${event.id}`}>
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <CardContent className="py-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    {/* Show memory count badge for past events */}
                    {event.memories && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {event.memories} souvenirs
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDate(event.date)}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex space-x-4">
                      <button className="flex items-center text-gray-600 hover:text-pink-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                      <button className="flex items-center text-gray-600 hover:text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-2">
                        {Array.from({ length: Math.min(3, event.participants || 0) }).map((_, i) => (
                          <Avatar key={i} className="h-6 w-6 border-2 border-white">
                            <AvatarImage src={`https://picsum.photos/200?random=${event.id}-${i}`} />
                            <AvatarFallback className="text-xs bg-purple-100 text-purple-800">U</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {event.participants} participant{event.participants > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Memories section - Only show if "all" or "past" filter is selected */}
          {(feedFilter === 'all' || feedFilter === 'past') && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Vos souvenirs</h3>
              <div className="space-y-4">
                {memories.map((memory) => (
                  <Card key={memory.id} className="overflow-hidden border-gray-100 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-sm transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{memory.title}</CardTitle>
                      <CardDescription>{memory.description}</CardDescription>
                    </CardHeader>
                    <div className="px-6 pb-3">
                      <div className="aspect-[16/9] overflow-hidden rounded-md">
                        <img 
                          src={memory.image} 
                          alt={memory.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <CardFooter className="pt-0 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleMemoryInteraction(memory)}>
                        Partager
                      </Button>
                      <div className="text-sm text-gray-500">
                        {formatDate(memory.date)}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* "Create new event" card always at the end */}
          <Link to="/events/create" className="block">
            <Card className="border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center p-6 transition-colors hover:bg-gray-100">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <p className="text-center text-gray-600 font-medium">Créer un nouvel événement</p>
              <p className="text-center text-gray-500 text-sm mt-2">Organisez une sortie en quelques clics</p>
            </Card>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
