
import React from 'react';
import { useInView } from 'react-intersection-observer';
import AppLayout from '../components/AppLayout';
import { CalendarIcon, Plus, RefreshCw, Filter } from 'lucide-react';

// Custom hooks
import { useEvents } from '../hooks/useEvents';
import { useDateFormatter } from '../hooks/useDateFormatter';
import { useEventStats } from '../hooks/useEventStats';
import { useStories } from '../hooks/useStories';

// Components 
import DashboardHeader from '../components/dashboard/DashboardHeader';
import EventStatsCards from '../components/dashboard/EventStatsCards';
import EventTabs from '../components/dashboard/EventTabs';
import EventGrid from '../components/dashboard/EventGrid';
import StoryCircles from '../components/dashboard/StoryCircles';
import StoryViewer from '../components/dashboard/StoryViewer';

const Dashboard = () => {
  // Custom hooks
  const { 
    events, loading, initialLoading, error, hasMore, 
    refreshing, feedFilter, fetchEventData, handleRefresh, handleFilterChange 
  } = useEvents();
  
  const { formatEventDate, isUpcomingEvent } = useDateFormatter();
  const eventStats = useEventStats(events, isUpcomingEvent);
  const { 
    userStories, storyContents, isStoryModalOpen, 
    selectedStoryId, openStory, closeStory, createStory 
  } = useStories();
  
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
          
          {/* Stories section - Instagram style */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <StoryCircles 
              stories={userStories}
              onCreateStory={createStory}
              onViewStory={openStory}
            />
          </div>
          
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
        
        {/* Story viewer modal */}
        <StoryViewer 
          open={isStoryModalOpen}
          onOpenChange={closeStory}
          stories={storyContents}
          currentStoryId={selectedStoryId}
        />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
