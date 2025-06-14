
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { demoBusinessEvents, demoBusinessConfigs, generateRealisticStats } from '@/data/demoData';
import { BusinessEvent } from '@/types/events';

export const useDemoData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadDemoEvents = async () => {
    setIsLoading(true);
    try {
      // Simuler un chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour les statistiques avec des valeurs réalistes
      const eventsWithUpdatedStats = demoBusinessEvents.map(event => ({
        ...event,
        ...generateRealisticStats(event.views)
      }));

      toast({
        title: "✅ Données de démo chargées",
        description: `${eventsWithUpdatedStats.length} événements de démonstration disponibles`,
      });

      return eventsWithUpdatedStats;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de démo",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoConfig = (businessType?: string) => {
    if (businessType) {
      return demoBusinessConfigs.find(config => 
        config.client_type.toLowerCase().includes(businessType.toLowerCase())
      ) || demoBusinessConfigs[0];
    }
    return demoBusinessConfigs[0];
  };

  const getEventsByVenue = (venueName: string): BusinessEvent[] => {
    return demoBusinessEvents.filter(event => 
      event.venue.toLowerCase().includes(venueName.toLowerCase())
    );
  };

  const getEventsByCategory = (category: string): BusinessEvent[] => {
    return demoBusinessEvents.filter(event => 
      event.event_type.toLowerCase() === category.toLowerCase()
    );
  };

  const getTotalStats = () => {
    const total = demoBusinessEvents.reduce((acc, event) => ({
      views: acc.views + event.views,
      likes: acc.likes + event.likes,
      participants: acc.participants + event.participants
    }), { views: 0, likes: 0, participants: 0 });

    return {
      ...total,
      events: demoBusinessEvents.length,
      averageParticipation: Math.round(total.participants / demoBusinessEvents.length)
    };
  };

  return {
    loadDemoEvents,
    getDemoConfig,
    getEventsByVenue,
    getEventsByCategory,
    getTotalStats,
    isLoading,
    demoEvents: demoBusinessEvents,
    demoConfigs: demoBusinessConfigs
  };
};
