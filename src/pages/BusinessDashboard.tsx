
import React, { useState } from 'react';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { useBusinessEvents } from '@/hooks/useBusinessEvents';
import BusinessProfile from '@/components/business/BusinessProfile';
import EventCreationForm from '@/components/business/EventCreationForm';
import EventList from '@/components/business/EventList';
import StatisticsCards from '@/components/business/StatisticsCards';
import PerformanceAnalytics from '@/components/business/PerformanceAnalytics';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BusinessEvent } from '@/types/events';

const BusinessDashboard = () => {
  const { config, loading: configLoading, error: configError } = useBusinessConfig();
  const { events, loading: eventsLoading, error: eventsError, createEvent, updateEvent, deleteEvent, clearError } = useBusinessEvents();
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null);

  const isLoading = configLoading || eventsLoading;
  const hasError = configError || eventsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message="Impossible de charger la configuration" 
          variant="destructive"
        />
      </div>
    );
  }

  const handleEventCreate = async (eventData: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>) => {
    const result = await createEvent(eventData);
    return result;
  };

  const handleEventUpdate = async (eventId: string, eventData: Partial<BusinessEvent>) => {
    const result = await updateEvent(eventId, eventData);
    if (result.data) {
      setEditingEvent(null);
    }
    return result;
  };

  const handleDeleteEvent = async (id: string) => {
    const result = await deleteEvent(id);
    return result;
  };

  const handleEditEvent = (event: BusinessEvent) => {
    setEditingEvent(event);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <BusinessProfile config={config} eventsCount={events.length} />

        <div className="container mx-auto p-6">
          {hasError && (
            <ErrorMessage 
              message={hasError.message} 
              onDismiss={clearError}
            />
          )}

          <StatisticsCards config={config} events={events} />

          <div className="grid lg:grid-cols-2 gap-8">
            <EventCreationForm 
              config={config} 
              onEventCreate={handleEventCreate}
              editingEvent={editingEvent}
              onEventUpdate={handleEventUpdate}
              onCancelEdit={handleCancelEdit}
            />
            <EventList 
              config={config} 
              events={events} 
              onDeleteEvent={handleDeleteEvent}
              onEditEvent={handleEditEvent}
            />
          </div>

          <PerformanceAnalytics config={config} events={events} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BusinessDashboard;
