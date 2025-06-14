import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BusinessEvent } from '@/types/events';
import { BusinessConfig } from '@/types/business';

export const useSupabaseDemoData = () => {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [configs, setConfigs] = useState<BusinessConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadDemoEvents = async () => {
    setIsLoading(true);
    try {
      // Fetch business events from Supabase
      const { data: businessEvents, error: eventsError } = await supabase
        .from('business_events')
        .select('*')
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch business configs from Supabase
      const { data: businessConfigs, error: configsError } = await supabase
        .from('business_configs')
        .select('*');

      if (configsError) throw configsError;

      // Transform data to match BusinessEvent type
      const transformedEvents: BusinessEvent[] = (businessEvents || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.venue,
        venue: event.venue,
        category: event.category as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
        event_type: event.event_type as 'a-boire' | 'a-manger' | 'soirees' | 'activites',
        price: event.price,
        image_url: event.image_url,
        views: event.views || 0,
        likes: event.likes || 0,
        participants: event.participants || 0,
        user_id: event.user_id
      }));

      // Transform configs with enhanced default features
      const transformedConfigs: BusinessConfig[] = (businessConfigs || []).map(config => ({
        ...config,
        features: config.features.length > 0 ? config.features : ['events', 'stats', 'analytics', 'redirections', 'ranking']
      }));

      setEvents(transformedEvents);
      setConfigs(transformedConfigs);

      toast({
        title: "✅ Données Supabase chargées",
        description: `${transformedEvents.length} événements et ${transformedConfigs.length} établissements récupérés`,
      });

      return transformedEvents;
    } catch (error) {
      console.error('Error loading demo data from Supabase:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données depuis Supabase",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateBusinessConfig = async (configId: string, updates: Partial<BusinessConfig>) => {
    try {
      const { error } = await supabase
        .from('business_configs')
        .update(updates)
        .eq('id', configId);

      if (error) throw error;

      // Update local state
      setConfigs(prev => prev.map(config => 
        config.id === configId ? { ...config, ...updates } : config
      ));

      toast({
        title: "✅ Configuration mise à jour",
        description: "Les modifications ont été sauvegardées",
      });
    } catch (error) {
      console.error('Error updating business config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    }
  };

  const generateTestEvents = async (count: number) => {
    setIsLoading(true);
    try {
      // Generate test events with realistic data
      const testEvents = Array.from({ length: count }, (_, i) => ({
        title: `Événement Test ${i + 1}`,
        description: `Description pour l'événement de test numéro ${i + 1}`,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: `${18 + (i % 6)}:00:00`,
        venue: `Lieu Test ${i + 1}`,
        category: ['a-boire', 'a-manger', 'soirees', 'activites'][i % 4],
        event_type: ['a-boire', 'a-manger', 'soirees', 'activites'][i % 4],
        price: `${10 + (i * 5)}€`,
        views: Math.floor(Math.random() * 100) + 50,
        likes: Math.floor(Math.random() * 20) + 5,
        participants: Math.floor(Math.random() * 30) + 10
      }));

      // Here you would normally insert these into Supabase
      // For demo purposes, we'll just add them to local state
      const newEvents = testEvents.map((event, i) => ({
        ...event,
        id: `test-${Date.now()}-${i}`,
        location: event.venue,
        user_id: 'demo-user'
      })) as BusinessEvent[];

      setEvents(prev => [...prev, ...newEvents]);

      toast({
        title: "✅ Événements générés",
        description: `${count} événements de test ont été créés`,
      });
    } catch (error) {
      console.error('Error generating test events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les événements de test",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearDemoData = () => {
    setEvents([]);
    toast({
      title: "🗑️ Données effacées",
      description: "Toutes les données de démo ont été supprimées",
    });
  };

  const getDemoConfig = (businessType?: string) => {
    if (businessType) {
      return configs.find(config => 
        config.client_type.toLowerCase().includes(businessType.toLowerCase())
      ) || configs[0];
    }
    return configs[0];
  };

  const getEventsByVenue = (venueName: string): BusinessEvent[] => {
    return events.filter(event => 
      event.venue.toLowerCase().includes(venueName.toLowerCase())
    );
  };

  const getEventsByCategory = (category: string): BusinessEvent[] => {
    return events.filter(event => 
      event.event_type === category
    );
  };

  const getTotalStats = () => {
    const total = events.reduce((acc, event) => ({
      views: acc.views + event.views,
      likes: acc.likes + event.likes,
      participants: acc.participants + event.participants
    }), { views: 0, likes: 0, participants: 0 });

    return {
      ...total,
      events: events.length,
      averageParticipation: events.length > 0 ? Math.round(total.participants / events.length) : 0
    };
  };

  return {
    loadDemoEvents,
    updateBusinessConfig,
    generateTestEvents,
    clearDemoData,
    getDemoConfig,
    getEventsByVenue,
    getEventsByCategory,
    getTotalStats,
    isLoading,
    demoEvents: events,
    demoConfigs: configs
  };
};
