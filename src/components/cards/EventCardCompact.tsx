import React from 'react';
import { Card } from '@/components/ui/card';
import { UnifiedEvent } from '@/types/unified';
import UrgentBadge from './UrgentBadge';
import SocialProof from './SocialProof';
import EventActions from './EventActions';

interface Friend {
  name: string;
  avatar: string;
  id: string;
}

interface EventCardCompactProps {
  event: UnifiedEvent & {
    friendsParticipating?: Friend[];
  };
  isLiked: boolean;
  isParticipating: boolean;
  onLike: () => void;
  onParticipate: () => void;
  onDislike: () => void;
  onCardClick?: () => void;
  className?: string;
  animate?: boolean;
  isListFormat?: boolean;
}

const EventCardCompact: React.FC<EventCardCompactProps> = ({
  event,
  isLiked,
  isParticipating,
  onLike,
  onParticipate,
  onDislike,
  onCardClick,
  className = '',
  animate = false,
  isListFormat = false
}) => {
  const formatDateTime = () => {
    const date = new Date(event.date);
    const now = new Date();
    
    // Format date relative
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    let dateText = '';
    if (isToday) dateText = 'Aujourd\'hui';
    else if (isTomorrow) dateText = 'Demain';
    else {
      dateText = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    }
    
    const timeText = event.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    return `${dateText} ${timeText}`;
  };

  const getLocationText = () => {
    // Extract simple location name (before comma if multiple parts)
    return event.location.split(',')[0].trim();
  };

  const getPriceText = () => {
    if (!event.price_text) return null;
    // Only show if not free
    if (event.price_text.toLowerCase().includes('gratuit') || event.price_text === '0€') return null;
    return event.price_text;
  };

  const friendsParticipating = event.friendsParticipating || [];

  return (
    <Card className={`overflow-hidden bg-background shadow-sm hover:shadow-md transition-all duration-300 ${animate ? 'animate-pulse-dynamic' : ''} ${className}`}>
      {/* Clickable Content Area - excludes action buttons */}
      <div 
        className="cursor-pointer"
        onClick={onCardClick}
      >
        {/* Image Section - 70% of space */}
        <div className="relative">
          <div 
            className="w-full bg-muted"
            style={{ aspectRatio: isListFormat ? '3/2' : '4/5' }}
          >
            <img
              src={event.image_url || "https://picsum.photos/400/500?random=event"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <UrgentBadge eventDate={event.date} eventTime={event.time} />
          </div>
        </div>

        {/* Info Section - 20% of space */}
        <div className="p-3 space-y-2">
          {/* Title + Price */}
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isListFormat ? 'text-sm' : 'text-base'} text-foreground truncate flex-1`}>
              {event.title}
            </h3>
            {getPriceText() && (
              <span className={`${isListFormat ? 'text-xs' : 'text-sm'} font-medium text-green-600 ml-2 whitespace-nowrap`}>
                {getPriceText()}
              </span>
            )}
          </div>

          {/* Date/Time + Location */}
          <div className={`${isListFormat ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
            {formatDateTime()} • {getLocationText()}
          </div>

          {/* Social Proof */}
          <SocialProof 
            friendsParticipating={friendsParticipating}
            totalParticipants={event.participants}
          />
        </div>
      </div>

      {/* Actions Section - 10% of space - NOT clickable for card navigation */}
      <div className="p-3 pt-0">
        <EventActions
          onDislike={onDislike}
          onParticipate={onParticipate}
          onLike={onLike}
          isLiked={isLiked}
          isParticipating={isParticipating}
        />
      </div>
    </Card>
  );
};

export default EventCardCompact;