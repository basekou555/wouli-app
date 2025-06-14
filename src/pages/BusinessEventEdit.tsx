
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBusinessEvents } from '@/hooks/useBusinessEvents';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import EventCreationForm from '@/components/business/EventCreationForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const BusinessEventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { config, loading: configLoading } = useBusinessConfig();
  const { updateEvent, loading: eventsLoading } = useBusinessEvents();

  // Get event from location state or find it in events
  const event = location.state?.event;

  if (configLoading || eventsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message="Configuration introuvable" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message="Événement introuvable" />
      </div>
    );
  }

  const handleEventUpdate = async (eventId: string, eventData: any) => {
    const result = await updateEvent(eventId, eventData);
    if (result.data) {
      navigate(`/business/event/${eventId}`, { 
        state: { event: result.data },
        replace: true
      });
    }
    return result;
  };

  const handleCancelEdit = () => {
    navigate(`/business/event/${id}`, { state: { event } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/business/event/${id}`, { state: { event } })}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modifier l'événement</h1>
            <p className="text-gray-600 mt-2">{event.title}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-2xl">
        <EventCreationForm
          config={config}
          onEventCreate={() => {}} // Not used in edit mode
          editingEvent={event}
          onEventUpdate={handleEventUpdate}
          onCancelEdit={handleCancelEdit}
        />
      </div>
    </div>
  );
};

export default BusinessEventEdit;
