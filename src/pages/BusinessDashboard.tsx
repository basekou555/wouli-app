
import React, { useState, useEffect } from 'react';
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

interface DemoConfig {
  clientName: string;
  clientType: string;
  location: string;
  brandColor: string;
  sampleEvents: number;
  features: string[];
}

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Configuration par défaut
  const defaultConfig: DemoConfig = {
    clientName: 'Blue Note Bar',
    clientType: 'Bar/Restaurant',
    location: 'Lyon',
    brandColor: '#FF7A1F',
    sampleEvents: 3,
    features: ['events', 'stats', 'participants']
  };

  const [config, setConfig] = useState<DemoConfig>(defaultConfig);

  // Charger la configuration depuis localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('demoConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
  }, []);

  // Générer des événements exemple basés sur la configuration
  const generateSampleEvents = (config: DemoConfig): BusinessEvent[] => {
    const eventTemplates = {
      'Bar/Restaurant': [
        { title: 'Soirée Jazz', description: 'Une soirée jazz intimiste', category: 'bar', price: '15€' },
        { title: 'Happy Hour', description: 'Cocktails à prix réduit', category: 'bar', price: '8€' },
        { title: 'Dégustation Vins', description: 'Découverte de vins locaux', category: 'bar', price: '25€' },
        { title: 'Concert Live', description: 'Groupe local en acoustique', category: 'bar', price: '12€' }
      ],
      'Salle de Sport': [
        { title: 'Cours de Yoga', description: 'Séance détente et bien-être', category: 'sport', price: '20€' },
        { title: 'CrossFit Challenge', description: 'Défi fitness intense', category: 'sport', price: '15€' },
        { title: 'Aqua Fitness', description: 'Sport aquatique en piscine', category: 'sport', price: '18€' },
        { title: 'Bootcamp Outdoor', description: 'Entraînement en extérieur', category: 'sport', price: '22€' }
      ],
      'Centre Commercial': [
        { title: 'Défilé de Mode', description: 'Présentation collections automne', category: 'shopping', price: 'Gratuit' },
        { title: 'Atelier Cuisine', description: 'Cours de cuisine avec chef', category: 'shopping', price: '35€' },
        { title: 'Exposition Art', description: 'Artistes locaux exposent', category: 'shopping', price: 'Gratuit' },
        { title: 'Marché Producteurs', description: 'Produits locaux et bio', category: 'shopping', price: 'Gratuit' }
      ]
    };

    const templates = eventTemplates[config.clientType as keyof typeof eventTemplates] || eventTemplates['Bar/Restaurant'];
    const events: BusinessEvent[] = [];

    for (let i = 0; i < config.sampleEvents; i++) {
      const template = templates[i % templates.length];
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      
      events.push({
        id: i + 1,
        ...template,
        date: date.toISOString().split('T')[0],
        time: `${18 + (i % 6)}:00`,
        participants: Math.floor(Math.random() * 50) + 10,
        venue: config.clientName,
        views: Math.floor(Math.random() * 200) + 50,
        likes: Math.floor(Math.random() * 30) + 5
      });
    }

    return events;
  };

  const [events, setEvents] = useState<BusinessEvent[]>([]);

  // Générer les événements quand la config change
  useEffect(() => {
    setEvents(generateSampleEvents(config));
  }, [config]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    venue: config.clientName,
    description: '',
    category: 'bar',
    price: ''
  });

  // Mettre à jour le venue quand le nom du client change
  useEffect(() => {
    setNewEvent(prev => ({ ...prev, venue: config.clientName }));
  }, [config.clientName]);

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
      venue: config.clientName,
      participants: 0,
      views: 0,
      likes: 0
    };

    setEvents([...events, event]);
    setNewEvent({ title: '', date: '', time: '', venue: config.clientName, description: '', category: 'bar', price: '' });
    
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
      {/* Header avec couleur de marque dynamique */}
      <div className="bg-white shadow-sm p-6 border-l-4" style={{ borderLeftColor: config.brandColor }}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard {config.clientType}</h1>
            <p className="text-gray-600 mt-2">Gérez vos événements et suivez vos performances</p>
            <div className="mt-4">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{config.clientName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: config.brandColor }}
                  ></div>
                  <span className="text-sm text-gray-600">Couleur de marque</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="mb-2"
            >
              Configuration Admin
            </Button>
            <p className="text-sm text-gray-500">🏙️ {config.location}, France</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Statistics Cards - conditionnelles selon les features */}
        {config.features.includes('stats') && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Événements</p>
                    <p className="text-2xl font-bold">{events.length}</p>
                  </div>
                  <Calendar className="h-8 w-8" style={{ color: config.brandColor }} />
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
            
            {config.features.includes('participants') && (
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
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Event Form - conditionnel selon les features */}
          {config.features.includes('events') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PlusCircle className="h-5 w-5 mr-2" style={{ color: config.brandColor }} />
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

                  <Button 
                    type="submit" 
                    className="w-full"
                    style={{ backgroundColor: config.brandColor }}
                  >
                    Créer l'événement
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

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
                            {config.features.includes('stats') && (
                              <div className="grid grid-cols-3 gap-2 mt-2">
                                {config.features.includes('participants') && (
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1 text-green-500" />
                                    <span className="font-medium">{event.participants}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1 text-blue-500" />
                                  <span className="font-medium">{event.views}</span>
                                </div>
                                <div className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1 text-red-500" />
                                  <span className="font-medium">{event.likes}</span>
                                </div>
                              </div>
                            )}
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

        {/* Analytics - conditionnel selon les features */}
        {config.features.includes('analytics') && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" style={{ color: config.brandColor }} />
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
                    Impact estimé: {Math.floor(totalViews * 1.3)} jeunes à {config.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
