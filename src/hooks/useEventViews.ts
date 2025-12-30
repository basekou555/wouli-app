import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedEvent } from '@/types/unified';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface EventView {
  event: UnifiedEvent;
  viewed_at: string;
  source: string;
}

export interface GroupedViews {
  label: string;
  views: EventView[];
}

export const useEventViews = () => {
  const { user } = useAuth();
  const [views, setViews] = useState<EventView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadViews = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Récupérer les vues récentes (30 derniers jours)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: userViews, error: viewsError } = await supabase
          .from('user_event_views')
          .select('event_id, viewed_at, source')
          .eq('user_id', user.id)
          .gte('viewed_at', thirtyDaysAgo.toISOString())
          .order('viewed_at', { ascending: false })
          .limit(100);

        if (viewsError) throw viewsError;
        if (!userViews?.length) {
          setViews([]);
          setLoading(false);
          return;
        }

        const eventIds = [...new Set(userViews.map(v => v.event_id))];

        // Récupérer les événements
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        if (eventsError) throw eventsError;

        const eventsMap = new Map(events?.map(e => [e.id, e]));

        const mappedViews: EventView[] = userViews
          .filter(v => eventsMap.has(v.event_id))
          .map(v => {
            const event = eventsMap.get(v.event_id)!;
            return {
              event: {
                id: event.id,
                title: event.title,
                description: event.description,
                date: event.date,
                time: event.time,
                location: event.location,
                address: event.address,
                category: event.category,
                image_url: event.image_url,
                price: event.price,
                views: event.views || 0,
                likes: event.likes || 0,
                participants: event.participants || 0,
                source: 'user' as const,
                organizer: '',
                organizer_type: 'user' as const,
                external_url: event.external_url,
                tags: event.tags,
              },
              viewed_at: v.viewed_at,
              source: v.source
            };
          });

        setViews(mappedViews);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      } finally {
        setLoading(false);
      }
    };

    loadViews();
  }, [user?.id]);

  // Grouper les vues par date
  const groupedViews: GroupedViews[] = views.reduce((groups, view) => {
    const viewDate = parseISO(view.viewed_at);
    let label: string;

    if (isToday(viewDate)) {
      label = "Aujourd'hui";
    } else if (isYesterday(viewDate)) {
      label = 'Hier';
    } else if (isThisWeek(viewDate)) {
      label = 'Cette semaine';
    } else {
      label = format(viewDate, 'MMMM yyyy', { locale: fr });
    }

    const existingGroup = groups.find(g => g.label === label);
    if (existingGroup) {
      existingGroup.views.push(view);
    } else {
      groups.push({ label, views: [view] });
    }

    return groups;
  }, [] as GroupedViews[]);

  return { views, groupedViews, loading };
};
