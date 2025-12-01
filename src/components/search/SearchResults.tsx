
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import WouliEventCard from '../cards/WouliEventCard';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
  const navigate = useNavigate();
  const hasActiveFilters = searchTerm || selectedCategory || selectedDate !== 'all';

  const handleCardClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleShare = (event: UnifiedEvent) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Découvre cet événement sur Wouli: ${event.title}`,
        url: window.location.origin + `/events/${event.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <p className="text-muted-foreground text-sm">
          {events.length} événement{events.length !== 1 ? 's' : ''} trouvé{events.length !== 1 ? 's' : ''}
        </p>
        {hasActiveFilters && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Filtres actifs
          </Badge>
        )}
      </div>

      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <WouliEventCard
                event={event}
                variant="list"
                isLiked={likedEvents.includes(event.id)}
                isParticipating={participatingEvents.includes(event.id)}
                onLike={() => onLike(event.id)}
                onParticipate={() => onParticipate(event.id)}
                onShare={() => handleShare(event)}
                onCardClick={() => handleCardClick(event.id)}
                className="w-full"
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
            <SearchIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Aucun événement trouvé</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            {searchTerm 
              ? `Aucun résultat pour "${searchTerm}"`
              : "Essayez de modifier vos critères de recherche"
            }
          </p>
          <Button 
            onClick={onClearFilters} 
            className="mt-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
          >
            Afficher tous les événements
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default SearchResults;
