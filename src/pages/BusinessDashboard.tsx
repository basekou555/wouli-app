
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, Users, MapPin, Trash2, Edit3, Eye, Heart, TrendingUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { categories } from '../data/mockEvents';

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
    venue: '',
    description: '',
    category: 'bar',
    price: ''
  });

  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null);
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
      participants: 0,
      views: 0,
      likes: 0
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', date: '', time: '', venue: '', description: '', category: 'bar', price: '' });
    
    toast({
      title: "✅ Événement créé !",
      description: `"${newEvent.title}" a été publié avec succès`,
    });
  };

  const handleEdit = (event: BusinessEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time,
      venue: event.venue,
      description: event.description || '',
      category: event.category,
      price: event.price || ''
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const updatedEvents = events.map(event => 
      event.id === editingEvent.id 
        ? { ...event, ...newEvent }
        : event
    );

    setEvents(updatedEvents);
    setEditingEvent(null);
    setNewEvent({ title: '', date: '', time: '', venue: '', description: '', category: 'bar', price: '' });
    
    toast({
      title: "✅ Événement modifié !",
      description: `"${newEvent.title}" a été mis à jour`,
    });
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setNewEvent({ title: '', date: '', time: '', venue: '', description: '', category: 'bar', price: '' });
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
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Gérez vos événements et suivez vos performances</p>
      </div>

      {/* Statistics */}
      <div className="container mx-auto p-6">
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
          {/* Create/Edit Event Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="h-5 w-5 mr-2" />
                {editingEvent ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingEvent ? handleUpdate : handleSubmit} className="space-y-4">
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
                    Catégorie
                  </label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(cat => cat.id !== 'all').map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu
                    </label>
                    <Input
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                      placeholder="Nom de votre établissement"
                    />
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

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingEvent ? 'Mettre à jour' : 'Créer l\'événement'}
                  </Button>
                  {editingEvent && (
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Annuler
                    </Button>
                  )}
                </div>
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
                              {event.venue} • {categories.find(c => c.id === event.category)?.name}
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {event.participants}
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {event.views}
                              </div>
                              <div className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {event.likes}
                              </div>
                            </div>
                            {event.price && (
                              <p className="text-sm font-medium text-green-600">{event.price}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(event)}
                            className="text-blue-500 hover:bg-blue-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
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
      </div>
    </div>
  );
};

export default BusinessDashboard;
