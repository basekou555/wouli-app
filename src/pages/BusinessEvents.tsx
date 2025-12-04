import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { BusinessLayout } from '@/components/business/BusinessLayout';
import EventList from '@/components/business/EventList';
import EventFilters, { DateFilter, StatusFilter, SortOption } from '@/components/business/EventFilters';
import EventCreationForm from '@/components/business/EventCreationForm';
import EventDraftsList from '@/components/business/EventDraftsList';
import { Button } from '@/components/ui/button';
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

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [venueFilter, setVenueFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  const { drafts, saveDraft, deleteDraft } = useEventDrafts();

  // Open form automatically if arriving with state
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

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let result = [...events];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.venue?.toLowerCase().includes(query) ||
        e.custom_venue?.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      result = result.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'today') {
          return eventDate.getTime() === today.getTime();
        }
        if (dateFilter === 'week') {
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return eventDate >= today && eventDate <= weekEnd;
        }
        if (dateFilter === 'month') {
          const monthEnd = new Date(today);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          return eventDate >= today && eventDate <= monthEnd;
        }
        return true;
      });
    }

    // Venue category filter
    if (venueFilter !== 'all') {
      result = result.filter(e => e.venue_category === venueFilter);
    }

    // Activity type filter
    if (activityFilter !== 'all') {
      result = result.filter(e => e.activity_type === activityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        if (statusFilter === 'upcoming') return eventDate >= today;
        if (statusFilter === 'past') return eventDate < today;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [events, searchQuery, dateFilter, venueFilter, activityFilter, statusFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setVenueFilter('all');
    setActivityFilter('all');
    setStatusFilter('all');
    setSortBy('date-desc');
  };
  
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
    setDuplicatingEvent({
      ...event,
      id: '',
      date: '',
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

  const getFormEventData = (): BusinessEvent | undefined => {
    if (editingEvent) return editingEvent;
    if (duplicatingEvent) return duplicatingEvent as BusinessEvent;
    if (resumingDraft) {
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mes Événements</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gérez vos événements et créez-en de nouveaux
            </p>
          </div>
          <Button 
            onClick={() => {
              if (showCreateForm) {
                handleCancelEdit();
              } else {
                setShowCreateForm(true);
              }
            }} 
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto" 
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

        {/* Filters & Events List */}
        {!showCreateForm && (
          <div className="space-y-4">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error.message} />
            ) : (
              <>
                <EventFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  dateFilter={dateFilter}
                  onDateFilterChange={setDateFilter}
                  venueFilter={venueFilter}
                  onVenueFilterChange={setVenueFilter}
                  activityFilter={activityFilter}
                  onActivityFilterChange={setActivityFilter}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  totalResults={filteredEvents.length}
                  onReset={resetFilters}
                />
                
                <EventList 
                  config={config} 
                  events={filteredEvents} 
                  onDeleteEvent={handleDeleteEvent} 
                  onEditEvent={handleEditEvent}
                  onDuplicateEvent={handleDuplicateEvent}
                />
              </>
            )}
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
