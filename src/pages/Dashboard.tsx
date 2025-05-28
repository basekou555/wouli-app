import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Clock3, CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '../context/AuthContext';
import { fetchEvents, EventData } from '../services/eventService';

interface EventData {
  id: string;
  title: string;
  location: string;
  date: Timestamp;
  image?: string;
  organizerName?: string;
  organizerAvatar?: string;
  participants?: string[];
  [key: string]: any; // Allow for additional properties
}

const Dashboard = () => {
  const [feedFilter, setFeedFilter] = useState<'all' | 'future' | 'past'>('all');
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const getEvents = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const eventsData = await fetchEvents(feedFilter);
        setEvents(eventsData);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, [user, feedFilter]);

  return (
    <AppLayout>
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accueil</h1>
            <p className="text-sm text-gray-500 mt-1">Découvrez ce qui se passe dans votre réseau</p>
          </div>
          <Link to="/events/create" className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Créer
          </Link>
        </div>

        <div className="border-b border-gray-200">
          <Tabs defaultValue="all" className="w-full" onValueChange={value => setFeedFilter(value as 'all' | 'future' | 'past')}>
            <TabsList>
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="future">À venir</TabsTrigger>
              <TabsTrigger value="past">Passés</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-10">
              <p>Chargement des événements...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-10">
              <p>Aucun événement trouvé</p>
            </div>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="overflow-hidden border-gray-100 hover:shadow-sm transition-shadow">
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={event.organizerAvatar} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{event.organizerName || 'Utilisateur'}</p>
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
                      src={event.image || 'https://picsum.photos/400/300'} 
                      alt={event.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </Link>

                <CardContent className="py-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {new Date(event.date.toDate()).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex space-x-4">
                        <Button variant="ghost" size="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </Button>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600">
                          {(event.participants?.length || 0)} participant{event.participants?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

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
