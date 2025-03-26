
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, Clock, Edit2, MapPin, Image, Users, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

// Données d'exemple pour le profil
const userProfile = {
  name: 'Marie Dupont',
  username: '@mariedupont',
  avatar: 'https://picsum.photos/200?random=profile',
  bio: 'Passionnée de sorties culturelles et gastronomiques. Toujours à la recherche de nouvelles expériences à Paris !',
  stats: {
    events: 12,
    friends: 86,
    photos: 124
  }
};

// Événements organisés
const organizedEvents = [
  {
    id: '1',
    title: 'Afterwork au Café des Artistes',
    date: '2024-05-15T18:00:00',
    location: 'Café des Artistes, Paris',
    participants: 8,
    image: 'https://picsum.photos/400/200?random=1'
  },
  {
    id: '11',
    title: 'Dîner d\'anniversaire',
    date: '2024-04-20T19:30:00',
    location: 'Restaurant Le Gourmet, Paris',
    participants: 10,
    image: 'https://picsum.photos/400/200?random=16'
  }
];

// Événements passés
const pastEvents = [
  {
    id: '12',
    title: 'Exposition Van Gogh',
    date: '2024-03-12T14:00:00',
    location: 'Musée d\'Orsay, Paris',
    participants: 5,
    image: 'https://picsum.photos/400/200?random=17'
  },
  {
    id: '13',
    title: 'Concert Jazz',
    date: '2024-02-28T20:00:00',
    location: 'Jazz Club, Paris',
    participants: 8,
    image: 'https://picsum.photos/400/200?random=18'
  },
  {
    id: '14',
    title: 'Dégustation de vins',
    date: '2024-01-15T19:00:00',
    location: 'Cave à vins, Paris',
    participants: 6,
    image: 'https://picsum.photos/400/200?random=19'
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

const Profile = () => {
  const [activeTab, setActiveTab] = useState('organized');

  return (
    <AppLayout>
      <div className="py-6 space-y-8">
        {/* En-tête du profil */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
              <img src={userProfile.avatar} alt={userProfile.name} />
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              <p className="text-gray-500">{userProfile.username}</p>
              
              <p className="mt-2 text-gray-700">{userProfile.bio}</p>
              
              <div className="mt-4 flex justify-center md:justify-start space-x-8">
                <div>
                  <p className="font-bold">{userProfile.stats.events}</p>
                  <p className="text-sm text-gray-500">Événements</p>
                </div>
                <div>
                  <p className="font-bold">{userProfile.stats.friends}</p>
                  <p className="text-sm text-gray-500">Amis</p>
                </div>
                <div>
                  <p className="font-bold">{userProfile.stats.photos}</p>
                  <p className="text-sm text-gray-500">Photos</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="flex items-center">
                <Edit2 className="h-4 w-4 mr-2" />
                Éditer le profil
              </Button>
              <Button variant="ghost" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
        
        {/* Onglets pour les différents types d'événements */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="organized">Organisés</TabsTrigger>
            <TabsTrigger value="participated">Participés</TabsTrigger>
            <TabsTrigger value="saved">Sauvegardés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organized" className="mt-6">
            {organizedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizedEvents.map((event) => (
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
                      <Calendar className="h-6 w-6 text-wouli-blue" />
                    </div>
                    <p className="text-center text-gray-600 font-medium">Organiser un événement</p>
                    <p className="text-center text-gray-500 text-sm mt-2">En moins de 30 secondes</p>
                  </Card>
                </Link>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Aucun événement organisé</h3>
                <p className="text-gray-500 mt-1">Vous n'avez pas encore organisé d'événement</p>
                <Button className="mt-4">
                  Organiser un événement
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="participated" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
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
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Image className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Aucun événement sauvegardé</h3>
              <p className="text-gray-500 mt-1">Explorez les événements et sauvegardez ceux qui vous intéressent</p>
              <Button className="mt-4" asChild>
                <Link to="/explore">Explorer les événements</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
