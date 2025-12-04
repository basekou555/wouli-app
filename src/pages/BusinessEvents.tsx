import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import EventList from '@/components/business/EventList';
import EventCreationForm from '@/components/business/EventCreationForm';
import EventDraftsList from '@/components/business/EventDraftsList';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBusinessEvents } from '@/hooks/useBusinessEvents';
import { useBusinessConfig } from '@/hooks/useBusinessConfig';
import { useEventDrafts, EventDraft } from '@/hooks/useEventDrafts';
import { BusinessEvent } from '@/types/events';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

export default function BusinessEvents() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BusinessEvent | null>(null);
  const [duplicatingEvent, setDuplicatingEvent] = useState<BusinessEvent | null>(null);
  const [resumingDraft, setResumingDraft] = useState<EventDraft | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  const { drafts, saveDraft, deleteDraft } = useEventDrafts();

  // Ouvrir le formulaire automatiquement si on arrive avec le state
  useEffect(() => {
    if (location.state?.openCreateForm) {
      setShowCreateForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent
  } = useBusinessEvents();
  const {
    config,
    loading: configLoading,
    error: configError
  } = useBusinessConfig();
  
  if (configLoading) return <LoadingSpinner />;
  if (configError || !config) return <ErrorMessage message="Erreur de configuration" />;
  
  const handleCreateEvent = async (eventData: Omit<BusinessEvent, 'id' | 'views' | 'likes' | 'participants' | 'user_id'>) => {
    const result = await createEvent(eventData);
    if (result.data) {
      setShowCreateForm(false);
      setEditingEvent(null);
      setDuplicatingEvent(null);
      setResumingDraft(null);
      toast({
        title: "Événement créé",
        description: "Votre événement a été publié avec succès"
      });
    }
  };
  
  const handleEditEvent = (event: BusinessEvent) => {
    setEditingEvent(event);
    setDuplicatingEvent(null);
    setResumingDraft(null);
    setShowCreateForm(true);
  };

  const handleDuplicateEvent = (event: BusinessEvent) => {
    // Create a copy without id and dates
    setDuplicatingEvent({
      ...event,
      id: '', // Will be generated on create
      date: '', // User needs to set new date
      title: `${event.title} (copie)`,
    });
    setEditingEvent(null);
    setResumingDraft(null);
    setShowCreateForm(true);
    toast({
      title: "Événement dupliqué",
      description: "Modifiez la date et les détails puis publiez"
    });
  };
  
  const handleUpdateEvent = async (eventId: string, eventData: Partial<BusinessEvent>) => {
    const result = await updateEvent(eventId, eventData);
    if (result.data) {
      setEditingEvent(null);
      setShowCreateForm(false);
      toast({
        title: "Événement mis à jour",
        description: "Les modifications ont été enregistrées"
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditingEvent(null);
    setDuplicatingEvent(null);
    setResumingDraft(null);
    setShowCreateForm(false);
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
    toast({
      title: "Événement supprimé",
      description: "L'événement a été supprimé"
    });
  };

  const handleSaveDraft = (draftData: Omit<EventDraft, 'id' | 'savedAt'>) => {
    saveDraft(draftData);
    toast({
      title: "Brouillon sauvegardé",
      description: "Vous pouvez le reprendre plus tard"
    });
  };

  const handleResumeDraft = (draft: EventDraft) => {
    setResumingDraft(draft);
    setEditingEvent(null);
    setDuplicatingEvent(null);
    setShowCreateForm(true);
    toast({
      title: "Brouillon chargé",
      description: "Continuez votre création d'événement"
    });
  };

  const handleDeleteDraft = (draftId: string) => {
    deleteDraft(draftId);
    toast({
      title: "Brouillon supprimé"
    });
  };

  // Determine which event data to pass to form
  const getFormEventData = (): BusinessEvent | undefined => {
    if (editingEvent) return editingEvent;
    if (duplicatingEvent) return duplicatingEvent as BusinessEvent;
    if (resumingDraft) {
      // Convert draft to BusinessEvent format
      return {
        id: '',
        title: resumingDraft.title,
        date: resumingDraft.date,
        end_date: resumingDraft.end_date,
        time: resumingDraft.time,
        venue: resumingDraft.venue,
        custom_venue: resumingDraft.custom_venue,
        description: resumingDraft.description,
        category: resumingDraft.category,
        event_type: resumingDraft.event_type,
        price: resumingDraft.price,
        external_url: resumingDraft.external_url,
        image_url: resumingDraft.image_url,
        venue_photo_url: resumingDraft.venue_photo_url,
        ambiance_photo_url: resumingDraft.ambiance_photo_url,
        capacity: resumingDraft.capacity ? Number(resumingDraft.capacity) : undefined,
        is_recurring: resumingDraft.is_recurring,
        avg_attendance: resumingDraft.avg_attendance ? Number(resumingDraft.avg_attendance) : undefined,
        total_editions: resumingDraft.total_editions ? Number(resumingDraft.total_editions) : undefined,
        venue_category: resumingDraft.venue_category,
        activity_type: resumingDraft.activity_type,
        music_style: resumingDraft.music_style,
        ambiance: resumingDraft.ambiance,
        target_audience: resumingDraft.target_audience,
        event_format: resumingDraft.event_format,
        social_intensity: resumingDraft.social_intensity,
        views: 0,
        likes: 0,
        participants: 0,
        user_id: ''
      } as BusinessEvent;
    }
    return undefined;
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
            onClick={() => {
              if (showCreateForm) {
                handleCancelEdit();
              } else {
                setShowCreateForm(true);
              }
            }} 
            className="bg-primary hover:bg-primary/90" 
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Annuler' : 'Nouvel événement'}
          </Button>
        </div>

        {/* Drafts List */}
        {!showCreateForm && drafts.length > 0 && (
          <EventDraftsList
            drafts={drafts}
            onResume={handleResumeDraft}
            onDelete={handleDeleteDraft}
          />
        )}

        {/* Event Creation Form */}
        {showCreateForm && (
          <EventCreationForm 
            config={config} 
            onEventCreate={handleCreateEvent} 
            editingEvent={getFormEventData()} 
            onEventUpdate={editingEvent ? handleUpdateEvent : undefined}
            onCancelEdit={handleCancelEdit}
            onSaveDraft={!editingEvent ? handleSaveDraft : undefined}
            isEditing={!!editingEvent}
            isDuplicating={!!duplicatingEvent}
          />
        )}

        {/* Events List */}
        <Card>
          <CardContent className="pt-6">
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
                onDuplicateEvent={handleDuplicateEvent}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </BusinessLayout>
  );
}
