import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import EventList from '@/components/business/EventList';
import EventCreationForm from '@/components/business/EventCreationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusinessEvents } from '@/hooks/useBusinessEvents';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { BusinessEvent } from '@/types/events';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function BusinessEvents() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null);
  
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useBusinessEvents();
  const { config, loading: configLoading, error: configError } = useBusinessConfig();

  if (configLoading) return <LoadingSpinner />;
  if (configError || !config) return <ErrorMessage message="Erreur de configuration" />;

  const handleCreateEvent = async (eventData: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>) => {
    const result = await createEvent(eventData);
    if (result.data) {
      setShowCreateForm(false);
    }
  };

  const handleEditEvent = (event: BusinessEvent) => {
    setEditingEvent(event);
    setShowCreateForm(true);
  };

  const handleUpdateEvent = async (eventId: string, eventData: Partial<BusinessEvent>) => {
    const result = await updateEvent(eventId, eventData);
    if (result.data) {
      setEditingEvent(null);
      setShowCreateForm(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setShowCreateForm(false);
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mes Événements</h1>
            <p className="text-muted-foreground">Gérez vos événements et créez-en de nouveaux</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Annuler' : 'Créer un événement'}
          </Button>
        </div>

        {/* Event Creation Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingEvent ? 'Modifier l\'événement' : 'Créer un nouvel événement'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventCreationForm
                config={config}
                onEventCreate={handleCreateEvent}
                editingEvent={editingEvent}
                onEventUpdate={handleUpdateEvent}
                onCancelEdit={handleCancelEdit}
              />
            </CardContent>
          </Card>
        )}

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des événements</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error.message} />
            ) : (
              <EventList
                config={config}
                events={events}
                onDeleteEvent={handleDeleteEvent}
                onEditEvent={handleEditEvent}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  );
}