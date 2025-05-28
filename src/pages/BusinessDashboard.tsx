
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, Users, MapPin, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const BusinessDashboard = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Soirée Jazz",
      date: "2024-03-15",
      time: "21:00",
      participants: 45,
      venue: "Blue Note Bar"
    },
    {
      id: 2,
      title: "Happy Hour",
      date: "2024-03-16",
      time: "18:00",
      participants: 23,
      venue: "Blue Note Bar"
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    description: ''
  });

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

    const event = {
      id: events.length + 1,
      ...newEvent,
      participants: 0
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', date: '', time: '', venue: '', description: '' });
    
    toast({
      title: "Événement créé !",
      description: `"${newEvent.title}" a été ajouté avec succès`,
    });
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
    toast({
      title: "Événement supprimé",
      description: "L'événement a été retiré de votre liste",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Gérez vos événements et attirez plus de clients</p>
      </div>

      <div className="container mx-auto p-6 grid lg:grid-cols-2 gap-8">
        {/* Créer un événement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              Créer un nouvel événement
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

        {/* Liste des événements */}
        <Card>
          <CardHeader>
            <CardTitle>Mes événements ({events.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun événement créé pour le moment
                </p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 bg-white">
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
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            {event.participants} participants
                          </div>
                        </div>
                      </div>
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDashboard;
