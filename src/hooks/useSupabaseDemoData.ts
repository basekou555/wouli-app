
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BusinessEvent } from '@/types/events';

export const useSupabaseDemoData = () => {
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
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

      setEvents(transformedEvents);
      setConfigs(businessConfigs || []);

      toast({
        title: "✅ Données Supabase chargées",
        description: `${transformedEvents.length} événements et ${businessConfigs?.length || 0} établissements récupérés`,
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
    getDemoConfig,
    getEventsByVenue,
    getEventsByCategory,
    getTotalStats,
    isLoading,
    demoEvents: events,
    demoConfigs: configs
  };
};
