import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, MessageSquare, Image, Share2, Users, Camera, Heart, User, ChevronDown } from 'lucide-react';

// Exemple de données pour un événement
const eventData = {
  id: '1',
  title: 'Afterwork au Café des Artistes',
  date: '2024-05-15T18:00:00',
  location: 'Café des Artistes',
  address: '12 Rue des Beaux-Arts, 75006 Paris',
  description: "Retrouvons-nous pour discuter de nos projets créatifs autour d'un verre ! Le lieu est idéal pour échanger dans une ambiance détendue et inspirante.",
  organizer: {
    name: 'Marie Dupont',
    avatar: 'https://picsum.photos/200?random=org'
  },
  participants: [
    { id: '1', name: 'Marie Dupont', avatar: 'https://picsum.photos/200?random=1', status: 'confirmed' },
    { id: '2', name: 'Paul Martin', avatar: 'https://picsum.photos/200?random=2', status: 'confirmed' },
    { id: '3', name: 'Sophie Laurent', avatar: 'https://picsum.photos/200?random=3', status: 'confirmed' },
    { id: '4', name: 'Thomas Petit', avatar: 'https://picsum.photos/200?random=4', status: 'pending' },
    { id: '5', name: 'Julie Moreau', avatar: 'https://picsum.photos/200?random=5', status: 'confirmed' },
    { id: '6', name: 'Lucas Bernard', avatar: 'https://picsum.photos/200?random=6', status: 'confirmed' },
  ],
  photos: [
    'https://picsum.photos/500/300?random=1',
    'https://picsum.photos/500/300?random=2',
    'https://picsum.photos/500/300?random=3',
    'https://picsum.photos/500/300?random=4',
  ],
  comments: [
    { id: '1', user: { name: 'Sophie Laurent', avatar: 'https://picsum.photos/200?random=3' }, text: "J'ai hâte d'y être ! Est-ce que quelqu'un sait s'ils ont de la bière artisanale ?", timestamp: '2024-05-10T14:30:00' },
    { id: '2', user: { name: 'Paul Martin', avatar: 'https://picsum.photos/200?random=2' }, text: 'Oui, ils ont une bonne sélection ! Et les cocktails sont très bons aussi.', timestamp: '2024-05-10T15:45:00' },
    { id: '3', user: { name: 'Marie Dupont', avatar: 'https://picsum.photos/200?random=1' }, text: "Je réserverai une table à l'étage, c'est plus calme pour discuter.", timestamp: '2024-05-11T09:20:00' },
  ]
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('infos');
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  // On utiliserait normalement l'ID pour récupérer les données
  const event = eventData;
  
  const displayedParticipants = showAllParticipants 
    ? event.participants 
    : event.participants.slice(0, 5);

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-500 mt-1">Organisé par {event.organizer.name}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image de couverture */}
            <div className="rounded-xl overflow-hidden h-60 md:h-80">
              <img
                src="https://picsum.photos/800/400?random=event"
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Onglets */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="infos">Infos</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="infos" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>À propos de cet événement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{event.description}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Participants ({event.participants.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {displayedParticipants.map((participant) => (
                        <div key={participant.id} className="flex flex-col items-center">
                          <Avatar>
                            <img src={participant.avatar} alt={participant.name} />
                          </Avatar>
                          <span className="text-sm mt-1 text-center">{participant.name}</span>
                          <span className={`text-xs ${participant.status === 'confirmed' ? 'text-green-500' : 'text-amber-500'}`}>
                            {participant.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {event.participants.length > 5 && !showAllParticipants && (
                      <Button 
                        variant="ghost" 
                        className="mt-4" 
                        onClick={() => setShowAllParticipants(true)}
                      >
                        Voir tous les participants
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="discussion" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Discussion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {event.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar>
                          <img src={comment.user.avatar} alt={comment.user.name} />
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{comment.user.name}</span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.timestamp)}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-700">{comment.text}</p>
                          <div className="mt-2 flex space-x-4">
                            <button className="text-xs text-gray-500 flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              J'aime
                            </button>
                            <button className="text-xs text-gray-500 flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Répondre
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6 border-t pt-6">
                      <div className="flex space-x-3">
                        <Avatar>
                          <User className="h-full w-full p-2" />
                        </Avatar>
                        <div className="flex-1">
                          <textarea 
                            className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Écrivez un commentaire..."
                            rows={3}
                          ></textarea>
                          <div className="mt-2 flex justify-end">
                            <Button>Publier</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="photos" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {event.photos.map((photo, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                        <Camera className="h-8 w-8 text-gray-400" />
                        <span className="mt-2 text-sm text-gray-500">Ajouter des photos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-sm text-gray-500">{formatTime(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-sm text-gray-500">{event.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{event.participants.length} participants</p>
                    <p className="text-sm text-gray-500">
                      {event.participants.filter(p => p.status === 'confirmed').length} confirmés, {' '}
                      {event.participants.filter(p => p.status === 'pending').length} en attente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="sticky top-20 space-y-3">
              <Button className="w-full" size="lg">
                Je participe
              </Button>
              
              <Button variant="outline" className="w-full">
                Peut-être
              </Button>
              
              <Button variant="ghost" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EventDetails;
