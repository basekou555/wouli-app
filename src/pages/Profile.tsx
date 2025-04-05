
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit2, MapPin, Image, Users, Settings, LogOut, Lock, Eye, EyeOff, ChevronRight, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

// Données d'exemple pour le profil
const userProfile = {
  name: 'Marie Dupont',
  username: '@mariedupont',
  avatar: 'https://picsum.photos/200?random=profile',
  bio: 'Passionnée de sorties culturelles et gastronomiques. Toujours à la recherche de nouvelles expériences à Paris !',
  isPublic: true,
  stats: {
    events: 12,
    friends: 86,
    photos: 124,
    organized: 5,
    participated: 18
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

// Événements futurs
const upcomingEvents = [
  {
    id: '2',
    title: 'Concert au Zénith',
    date: '2024-05-25T20:00:00',
    location: 'Zénith, Paris',
    participants: 12,
    image: 'https://picsum.photos/400/200?random=2'
  },
  {
    id: '3',
    title: 'Festival d\'été',
    date: '2024-06-15T14:00:00',
    location: 'Parc de la Villette, Paris',
    participants: 25,
    image: 'https://picsum.photos/400/200?random=3'
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
    image: 'https://picsum.photos/400/200?random=17',
    hasPhotos: true,
    hasVideo: true
  },
  {
    id: '13',
    title: 'Concert Jazz',
    date: '2024-02-28T20:00:00',
    location: 'Jazz Club, Paris',
    participants: 8,
    image: 'https://picsum.photos/400/200?random=18',
    hasPhotos: true,
    hasVideo: false
  },
  {
    id: '14',
    title: 'Dégustation de vins',
    date: '2024-01-15T19:00:00',
    location: 'Cave à vins, Paris',
    participants: 6,
    image: 'https://picsum.photos/400/200?random=19',
    hasPhotos: true,
    hasVideo: true
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
  const [activeTab, setActiveTab] = useState('upcoming');
  const [privacyTab, setPrivacyTab] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState(userProfile.isPublic ? "public" : "private");
  const [eventVisibility, setEventVisibility] = useState("friends");

  const togglePrivacySettings = () => {
    setPrivacyTab(!privacyTab);
  };

  return (
    <AppLayout>
      <div className="py-6 space-y-8">
        {/* En-tête du profil avec statut de confidentialité */}
        <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                <img src={userProfile.avatar} alt={userProfile.name} />
              </Avatar>
              <div className="absolute -bottom-2 -right-2 flex items-center bg-white rounded-full p-1 shadow-sm">
                {userProfile.isPublic ? (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    <Eye className="h-3 w-3 mr-1" /> Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    <EyeOff className="h-3 w-3 mr-1" /> Privé
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              <p className="text-gray-500">{userProfile.username}</p>
              
              <p className="mt-2 text-gray-700">{userProfile.bio}</p>
              
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <Badge variant="outline" className="flex items-center p-2 bg-purple-50 text-purple-700 border-purple-200">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  <span className="font-bold">{userProfile.stats.organized}</span>
                  <span className="ml-1">organisés</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center p-2 bg-pink-50 text-pink-700 border-pink-200">
                  <Users className="h-3 w-3 mr-1.5" />
                  <span className="font-bold">{userProfile.stats.participated}</span>
                  <span className="ml-1">participés</span>
                </Badge>
                
                <Badge variant="outline" className="flex items-center p-2 bg-blue-50 text-blue-700 border-blue-200">
                  <Image className="h-3 w-3 mr-1.5" />
                  <span className="font-bold">{userProfile.stats.photos}</span>
                  <span className="ml-1">photos</span>
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button variant="outline" className="flex items-center">
                <Edit2 className="h-4 w-4 mr-2" />
                Éditer le profil
              </Button>
              <Button 
                variant={privacyTab ? "secondary" : "ghost"} 
                className="flex items-center"
                onClick={togglePrivacySettings}
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
        
        {/* Section des paramètres de confidentialité */}
        {privacyTab && (
          <Card className="animate-fade-down">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Paramètres de confidentialité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Statut du profil</h3>
                <RadioGroup 
                  value={profileVisibility} 
                  onValueChange={setProfileVisibility}
                  className="flex gap-4"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="public" id="public-profile" />
                    <div className="grid gap-1.5">
                      <FormLabel htmlFor="public-profile" className="font-medium">Public</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Votre profil est visible par tous
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="private" id="private-profile" />
                    <div className="grid gap-1.5">
                      <FormLabel htmlFor="private-profile" className="font-medium">Privé</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Seuls vos amis peuvent voir votre profil
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Visibilité des événements passés</h3>
                <RadioGroup 
                  value={eventVisibility} 
                  onValueChange={setEventVisibility}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="public" id="public-events" />
                    <div className="grid gap-1.5">
                      <FormLabel htmlFor="public-events" className="font-medium">Public</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Visibles par tous les utilisateurs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="friends" id="friends-events" />
                    <div className="grid gap-1.5">
                      <FormLabel htmlFor="friends-events" className="font-medium">Amis</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Visibles uniquement par vos amis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="participants" id="participants-events" />
                    <div className="grid gap-1.5">
                      <FormLabel htmlFor="participants-events" className="font-medium">Participants</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Visibles uniquement par les participants de l'événement
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="ml-auto">Enregistrer</Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Onglets pour les différents types d'événements */}
        {!privacyTab && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="upcoming">À venir</TabsTrigger>
              <TabsTrigger value="past">Passés</TabsTrigger>
            </TabsList>
            
            {/* Événements à venir */}
            <TabsContent value="upcoming" className="mt-6">
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <Link to={`/events/${event.id}`} key={event.id} className="block group">
                      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 h-40 overflow-hidden">
                            <img 
                              src={event.image} 
                              alt={event.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{event.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span className="text-sm">{event.participants} participants</span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Calendar className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucun événement à venir</h3>
                    <p className="text-gray-500 mt-1">Explorez les événements pour découvrir de nouvelles activités</p>
                    <Button className="mt-4" asChild>
                      <Link to="/explore">Explorer les événements</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Événements passés */}
            <TabsContent value="past" className="mt-6">
              <div className="space-y-4">
                {pastEvents.length > 0 ? (
                  pastEvents.map((event) => (
                    <Link to={`/events/${event.id}`} key={event.id} className="block group">
                      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 h-40 overflow-hidden relative">
                            <img 
                              src={event.image} 
                              alt={event.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              {event.hasPhotos && (
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                                  <Image className="h-3 w-3 mr-1" />
                                  Photos
                                </Badge>
                              )}
                              {event.hasVideo && (
                                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm">
                                  <Film className="h-3 w-3 mr-1" />
                                  Vidéo
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{event.location}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-gray-600">
                                <Users className="h-4 w-4 mr-2" />
                                <span className="text-sm">{event.participants} participants</span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Image className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucun événement passé</h3>
                    <p className="text-gray-500 mt-1">Vos événements passés apparaîtront ici</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
