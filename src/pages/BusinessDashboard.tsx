
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, Users, MapPin, Trash2, Edit3, Eye, Heart, TrendingUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

interface BusinessEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  participants: number;
  venue: string;
  description?: string;
  category: string;
  price?: string;
  views: number;
  likes: number;
}

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<BusinessEvent[]>([
    {
      id: 1,
      title: "Soirée Jazz",
      date: "2024-06-15",
      time: "21:00",
      participants: 45,
      venue: "Blue Note Bar",
      description: "Une soirée jazz intimiste",
      category: "bar",
      price: "15€",
      views: 234,
      likes: 18
    },
    {
      id: 2,
      title: "Happy Hour",
      date: "2024-06-16",
      time: "18:00",
      participants: 23,
      venue: "Blue Note Bar",
      description: "Cocktails à prix réduit",
      category: "bar",
      price: "8€",
      views: 145,
      likes: 12
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    venue: 'Blue Note Bar',
    description: '',
    category: 'bar',
    price: ''
  });

  const [establishmentName, setEstablishmentName] = useState('Blue Note Bar');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const event: BusinessEvent = {
      id: events.length + 1,
      ...newEvent,
      venue: establishmentName,
      participants: 0,
      views: 0,
      likes: 0
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', date: '', time: '', venue: establishmentName, description: '', category: 'bar', price: '' });
    
    toast({
      title: "✅ Événement créé !",
      description: `"${newEvent.title}" a été publié avec succès`,
    });
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "🗑️ Événement supprimé",
      description: "L'événement a été retiré de votre liste",
    });
  };

  const totalViews = events.reduce((sum, event) => sum + event.views, 0);
  const totalLikes = events.reduce((sum, event) => sum + event.likes, 0);
  const totalParticipants = events.reduce((sum, event) => sum + event.participants, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Entreprise</h1>
            <p className="text-gray-600 mt-2">Gérez vos événements et suivez vos performances</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de votre établissement
              </label>
              <Input
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                className="max-w-xs"
                placeholder="Ex: Blue Note Bar"
              />
            </div>
          </div>
          <div className="text-right">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="mb-2"
            >
              Mode Admin
            </Button>
            <p className="text-sm text-gray-500">🏙️ Lyon, France</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Événements</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vues totales</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Likes</p>
                  <p className="text-2xl font-bold">{totalLikes}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="text-2xl font-bold">{totalParticipants}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Event Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                Créer un événement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de l'événement *
                  </label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Ex: Soirée Jazz, Happy Hour..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure *
                    </label>
                    <Input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix
                  </label>
                  <Input
                    value={newEvent.price}
                    onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                    placeholder="Ex: 15€, Gratuit..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Décrivez votre événement..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Créer l'événement
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Mes événements ({events.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucun événement créé pour le moment
                  </p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(event.date).toLocaleDateString('fr-FR')} à {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.venue}
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1 text-green-500" />
                                <span className="font-medium">{event.participants}</span>
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1 text-blue-500" />
                                <span className="font-medium">{event.views}</span>
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 mr-1 text-red-500" />
                                <span className="font-medium">{event.likes}</span>
                              </div>
                            </div>
                            {event.price && (
                              <p className="text-sm font-medium text-green-600">{event.price}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteEvent(event.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Analytics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Aperçu des performances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Visibilité</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Vos événements ont été vus {totalViews} fois cette semaine
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Engagement</h4>
                <p className="text-sm text-green-800 mt-1">
                  Taux de participation: {totalViews > 0 ? Math.round((totalParticipants / totalViews) * 100) : 0}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900">Portée</h4>
                <p className="text-sm text-purple-800 mt-1">
                  Impact estimé: {Math.floor(totalViews * 1.3)} jeunes à Lyon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDashboard;
