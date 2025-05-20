
import React from 'react';
import { useInView } from 'react-intersection-observer';
import AppLayout from '../components/AppLayout';
import { CalendarIcon, Plus, RefreshCw, Filter } from 'lucide-react';

// Custom hooks
import { useEvents } from '../hooks/useEvents';
import { useDateFormatter } from '../hooks/useDateFormatter';
import { useEventStats } from '../hooks/useEventStats';

// Components 
import DashboardHeader from '../components/dashboard/DashboardHeader';
import EventStatsCards from '../components/dashboard/EventStatsCards';
import EventTabs from '../components/dashboard/EventTabs';
import EventGrid from '../components/dashboard/EventGrid';

const Dashboard = () => {
  // Custom hooks
  const { 
    events, loading, initialLoading, error, hasMore, 
    refreshing, feedFilter, fetchEventData, handleRefresh, handleFilterChange 
  } = useEvents();
  
  const { formatEventDate, isUpcomingEvent } = useDateFormatter();
  const eventStats = useEventStats(events, isUpcomingEvent);
  
  // Infinite scroll with intersection observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  // Handle infinite scroll loading
  React.useEffect(() => {
    if (inView && !loading && hasMore && !initialLoading) {
      fetchEventData();
    }
  }, [inView, loading, hasMore, initialLoading, fetchEventData]);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 py-4">
          {/* Header section */}
          <DashboardHeader 
            onRefresh={handleRefresh} 
            isRefreshing={refreshing} 
          />
          
          {/* Stats cards */}
          <EventStatsCards stats={eventStats} />

          {/* Tabs filter */}
          <EventTabs 
            onValueChange={handleFilterChange} 
            defaultValue={feedFilter} 
          />

          {/* Events grid and related content */}
          <EventGrid 
            events={events}
            loading={loading}
            initialLoading={initialLoading}
            error={error}
            hasMore={hasMore}
            loadMoreRef={loadMoreRef}
            refreshEvents={() => fetchEventData(true)}
            isUpcomingEvent={isUpcomingEvent}
            formatEventDate={formatEventDate}
            setFeedFilter={handleFilterChange}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
