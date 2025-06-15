
import React from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import EventHeroSection from '@/components/event-preview/EventHeroSection';
import EventDetailsSection from '@/components/event-preview/EventDetailsSection';
import EventStatsSection from '@/components/event-preview/EventStatsSection';
import EventActionsSection from '@/components/event-preview/EventActionsSection';
import { useEventPreview } from '@/hooks/useEventPreview';

const EventPreview = () => {
  const { id } = useParams<{ id: string }>();
  const { event, loading, error, handleParticipate, handleLike } = useEventPreview(id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Événement non trouvé</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  console.log('🎭 Rendu EventPreview avec événement:', event);

  return (
    <div className="min-h-screen bg-gray-50">
      <EventHeroSection event={event} />

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <EventDetailsSection event={event} />
            
            <div className="space-y-6">
              <EventStatsSection event={event} />
              <EventActionsSection 
                event={event} 
                onParticipate={handleParticipate}
                onLike={handleLike}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;
