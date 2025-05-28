
import React, { ReactNode } from 'react';
import { EventData } from '../../services/eventService';
import EventCard from './EventCard';
import EventSkeleton from './EventSkeleton';
import { Link } from 'react-router-dom';
import { ChevronDown, CalendarIcon, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EventGridProps {
  events: EventData[];
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMoreRef: (node?: Element | null) => void;
  refreshEvents: () => void;
  isUpcomingEvent: (date: any) => boolean;
  formatEventDate: (date: any) => string;
  setFeedFilter: (filter: 'all' | 'future' | 'past') => void;
}

const EventGrid: React.FC<EventGridProps> = ({
  events,
  loading,
  initialLoading,
  error,
  hasMore,
  loadMoreRef,
  refreshEvents,
  isUpcomingEvent,
  formatEventDate,
  setFeedFilter
}) => {
  // Error display component
  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50" 
          onClick={refreshEvents}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    );
  };

  // Empty state component
  const renderEmptyState = () => {
    if (loading || initialLoading || events.length > 0 || error) return null;
    
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <CalendarIcon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Aucun événement trouvé</h3>
        <p className="text-gray-500 text-center mt-2 max-w-md">
          Aucun événement ne correspond à vos critères actuels. Essayez de modifier vos filtres ou créez votre propre événement.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={() => setFeedFilter('all')}
            className="flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Voir tous les événements
          </Button>
          <Link to="/events/create">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Créer un événement
            </Button>
          </Link>
        </div>
      </div>
    );
  };

  // Loading indicator at bottom of list for infinite scroll
  const renderLoadMoreIndicator = () => {
    if (!hasMore || loading || events.length === 0) return null;
    
    return (
      <div ref={loadMoreRef} className="col-span-full flex justify-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <ChevronDown className="h-6 w-6 text-gray-400" />
          <p className="text-sm text-gray-500">Chargement d'autres événements</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderErrorMessage()}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            isUpcomingEvent={isUpcomingEvent}
            formatEventDate={formatEventDate}
          />
        ))}
        
        {/* Skeleton loaders */}
        {(loading || initialLoading) && 
          Array(initialLoading ? 6 : 3).fill(0).map((_, index) => <EventSkeleton key={`skeleton-${index}`} />)
        }
        
        {renderEmptyState()}
        {renderLoadMoreIndicator()}
      </div>

      {/* Call to action */}
      <Link to="/events/create" className="block">
        <Card className="border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8 transition-colors hover:from-purple-50 hover:to-pink-50 group">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Créer un nouvel événement</h3>
          <p className="text-center text-gray-600 text-sm max-w-md">
            Partagez vos passions, organisez des sorties et connectez-vous avec d'autres personnes. Quelques clics suffisent pour commencer.
          </p>
          <Button className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
            Commencer maintenant
          </Button>
        </Card>
      </Link>
    </div>
  );
};

export default EventGrid;
