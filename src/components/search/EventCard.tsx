
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedEvent } from '@/types/unified';
import EventCardCompact from '../cards/EventCardCompact';

interface Friend {
  name: string;
  avatar: string;
  id: string;
}

interface EventCardProps {
  event: UnifiedEvent & {
    friendsParticipating?: Friend[];
  };
  isLiked: boolean;
  isParticipating: boolean;
  onLike: () => void;
  onParticipate: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isLiked,
  isParticipating,
  onLike,
  onParticipate
}) => {
  const navigate = useNavigate();

  const handleDislike = () => {
    // In search mode, dislike doesn't do anything for now
  };

  const handleCardClick = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <EventCardCompact
      event={event}
      isLiked={isLiked}
      isParticipating={isParticipating}
      onLike={onLike}
      onParticipate={onParticipate}
      onDislike={handleDislike}
      onCardClick={handleCardClick}
      className="w-full"
      isListFormat={true}
    />
  );
};

export default EventCard;
