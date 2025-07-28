
import React from 'react';
import { UnifiedEvent } from '@/types/unified';
import EventCardCompact from '../cards/EventCardCompact';
import { useNavigate } from 'react-router-dom';

interface Friend {
  name: string;
  avatar: string;
  id: string;
}

interface SwipeCardProps {
  event: UnifiedEvent & {
    friendsParticipating?: Friend[];
  };
  onLike: () => void;
  onParticipate: () => void;
  onNext: () => void;
  onView: () => void;
  onDislike?: () => void;
  isLiked?: boolean;
  isParticipating?: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  event,
  onLike,
  onParticipate,
  onNext,
  onView,
  onDislike,
  isLiked = false,
  isParticipating = false
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    onView();
    navigate(`/events/${event.id}`);
  };

  const handleDislike = () => {
    if (onDislike) {
      onDislike();
    } else {
      onNext(); // Fallback
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <EventCardCompact
        event={event}
        isLiked={isLiked}
        isParticipating={isParticipating}
        onLike={onLike}
        onParticipate={onParticipate}
        onDislike={handleDislike}
        className="h-auto shadow-lg"
        animate={true}
      />
      
      {/* Additional actions for swipe mode */}
      <div className="mt-4 flex justify-center space-x-2">
        <button
          onClick={handleViewDetails}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Voir détails
        </button>
        <span className="text-muted-foreground">•</span>
        <button
          onClick={onNext}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;
