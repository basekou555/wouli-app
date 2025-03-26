
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Search, Users, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Exemple d'événements à explorer
const exploreEvents = [
  {
    id: '5',
    title: 'Festival de Musique Électronique',
    date: '2024-06-15T20:00:00',
    location: 'Parc des Expositions, Paris',
    participants: 120,
    image: 'https://picsum.photos/400/200?random=10',
    type: 'public'
  },
  {
    id: '6',
    title: 'Séance de Yoga en Plein Air',
    date: '2024-05-22T09:00:00',
    location: 'Parc Monceau, Paris',
    participants: 15,
    image: 'https://picsum.photos/400/200?random=11',
    type: 'public'
  },
  {
    id: '7',
    title: 'Atelier Cuisine Italienne',
    date: '2024-05-28T18:30:00',
    location: 'École de Cuisine, Lyon',
    participants: 8,
    image: 'https://picsum.photos/400/200?random=12',
    type: 'public'
  },
  {
    id: '8',
    title: 'Tournoi de Pétanque Amateur',
    date: '2024-06-02T14:00:00',
    location: 'Place du village, Marseille',
    participants: 24,
    image: 'https://picsum.photos/400/200?random=13',
    type: 'public'
  },
  {
    id: '9',
    title: 'Soirée Jeux de Société',
    date: '2024-05-30T19:00:00',
    location: 'Bar à Jeux, Bordeaux',
    participants: 12,
    image: 'https://picsum.photos/400/200?random=14',
    type: 'friends'
  },
  {
    id: '10',
    title: 'Randonnée en Montagne',
    date: '2024-06-08T08:00:00',
    location: 'Mont Blanc, Chamonix',
    participants: 8,
    image: 'https://picsum.photos/400/200?random=15',
    type: 'friends'
  },
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

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'friends'
  
  const filteredEvents = exploreEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || event.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout>
      <div className="py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Explorer les événements</h1>
          <p className="text-gray-500">Découvrez des événements intéressants à proximité</p>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un événement ou un lieu"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilter('all')}
              className="flex-shrink-0"
            >
              Tous
            </Button>
            <Button 
              variant={filter === 'public' ? 'default' : 'outline'} 
              onClick={() => setFilter('public')}
              className="flex-shrink-0"
            >
              Publics
            </Button>
            <Button 
              variant={filter === 'friends' ? 'default' : 'outline'} 
              onClick={() => setFilter('friends')}
              className="flex-shrink-0"
            >
              Amis
            </Button>
          </div>
        </div>
        
        {/* Liste des événements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
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
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucun événement trouvé</h3>
              <p className="text-gray-500 mt-1">Essayez de modifier vos critères de recherche</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
