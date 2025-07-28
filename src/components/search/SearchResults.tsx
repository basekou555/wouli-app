
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import EventCard from './EventCard';

interface SearchResultsProps {
  events: UnifiedEvent[];
  searchTerm: string;
  selectedCategory: string | null;
  selectedDate: string;
  likedEvents: string[];
  participatingEvents: string[];
  onLike: (eventId: string) => void;
  onParticipate: (eventId: string) => void;
  onClearFilters: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  events,
  searchTerm,
  selectedCategory,
  selectedDate,
  likedEvents,
  participatingEvents,
  onLike,
  onParticipate,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || selectedCategory || selectedDate !== 'all';

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          {events.length} événement{events.length !== 1 ? 's' : ''} trouvé{events.length !== 1 ? 's' : ''}
        </p>
        {hasActiveFilters && (
          <Badge variant="secondary">
            Filtres actifs
          </Badge>
        )}
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isLiked={likedEvents.includes(event.id)}
              isParticipating={participatingEvents.includes(event.id)}
              onLike={() => onLike(event.id)}
              onParticipate={() => onParticipate(event.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun événement trouvé</h3>
          <p className="text-gray-500 mt-2">
            {searchTerm 
              ? `Aucun résultat pour "${searchTerm}"`
              : "Essayez de modifier vos critères de recherche"
            }
          </p>
          <Button variant="outline" onClick={onClearFilters} className="mt-4">
            Afficher tous les événements
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
