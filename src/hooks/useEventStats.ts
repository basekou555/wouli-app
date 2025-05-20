
import { useMemo } from 'react';
import { EventData } from '../services/eventService';

export const useEventStats = (
  events: EventData[], 
  isUpcomingEvent: (date: any) => boolean
) => {
  // Calculate grouped event statistics
  const eventStats = useMemo(() => {
    if (events.length === 0) return { upcoming: 0, past: 0, total: 0 };
    
    return events.reduce((stats, event) => {
      const isUpcoming = isUpcomingEvent(event.date);
      return {
        upcoming: stats.upcoming + (isUpcoming ? 1 : 0),
        past: stats.past + (isUpcoming ? 0 : 1),
        total: stats.total + 1
      };
    }, { upcoming: 0, past: 0, total: 0 });
  }, [events, isUpcomingEvent]);

  return eventStats;
};
