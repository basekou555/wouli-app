
import React, { useState, useEffect } from 'react';
import BusinessProfile from '@/components/business/BusinessProfile';
import EventCreationForm from '@/components/business/EventCreationForm';
import EventList from '@/components/business/EventList';
import StatisticsCards from '@/components/business/StatisticsCards';
import PerformanceAnalytics from '@/components/business/PerformanceAnalytics';

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
  imageUrl?: string;
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
      'Boîte de Nuit': [
        { title: 'Soirée House', description: 'DJ international en live', category: 'nightclub', price: '20€' },
        { title: 'Ladies Night', description: 'Entrée gratuite pour les femmes', category: 'nightclub', price: '15€' },
        { title: 'Techno Night', description: 'Les meilleurs DJs techno', category: 'nightclub', price: '25€' },
        { title: 'Student Party', description: 'Soirée étudiante avec tarifs réduits', category: 'nightclub', price: '10€' }
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

  const handleEventCreate = (eventData: Omit<BusinessEvent, 'id' | 'participants' | 'views' | 'likes'>) => {
    const event: BusinessEvent = {
      id: events.length + 1,
      ...eventData,
      participants: 0,
      views: 0,
      likes: 0
    };

    setEvents([...events, event]);
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessProfile config={config} eventsCount={events.length} />

      <div className="container mx-auto p-6">
        <StatisticsCards config={config} events={events} />

        <div className="grid lg:grid-cols-2 gap-8">
          <EventCreationForm config={config} onEventCreate={handleEventCreate} />
          <EventList config={config} events={events} onDeleteEvent={handleDeleteEvent} />
        </div>

        <PerformanceAnalytics config={config} events={events} />
      </div>
    </div>
  );
};

export default BusinessDashboard;
