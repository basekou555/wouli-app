
import React from 'react';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { useBusinessEvents } from '@/hooks/useBusinessEvents';
import BusinessProfile from '@/components/business/BusinessProfile';
import EventCreationForm from '@/components/business/EventCreationForm';
import EventList from '@/components/business/EventList';
import StatisticsCards from '@/components/business/StatisticsCards';
import PerformanceAnalytics from '@/components/business/PerformanceAnalytics';

const BusinessDashboard = () => {
  const { config, loading: configLoading } = useBusinessConfig();
  const { events, loading: eventsLoading, createEvent, deleteEvent } = useBusinessEvents();

  if (configLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur lors du chargement de la configuration</p>
        </div>
      </div>
    );
  }

  const handleEventCreate = (eventData: any) => {
    createEvent(eventData);
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
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
