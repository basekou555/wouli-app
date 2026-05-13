import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedEvent } from '@/types/unified';
import {
  getUrgencyBadge,
  getSocialProofText,
  formatEventDateTime,
  getPriceInfo,
  getLocationDisplay,
} from '@/utils/eventCardHelpers';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';

interface EventListCardProps {
  event: UnifiedEvent;
  isLiked: boolean;
  isParticipating: boolean;
  onLike: () => void;
  onParticipate: () => void;
  onShare?: () => void;
  onCardClick?: () => void;
  className?: string;
}

const EventListCard: React.FC<EventListCardProps> = ({
  event,
  isLiked,
  isParticipating,
  onLike,
  onParticipate,
  onShare,
  onCardClick,
  className = '',
}) => {
  const urgencyLabel = getUrgencyBadge(event.date, event.time);
  const priceInfo = getPriceInfo(event.price_text);
  const friends = event.friendsParticipating || [];
  const totalParticipants = event.totalParticipants || event.participants || 0;

  return (
    <Card
      className={`flex gap-3 p-3 rounded-xl bg-card cursor-pointer transition-colors hover:bg-accent/50 ${className}`}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0" onClick={onCardClick}>
        <div className="w-20 aspect-[4/5] rounded-lg overflow-hidden bg-muted">
          <img
            src={getProxiedImageUrl(event.image_url) || 'https://picsum.photos/80/100?random=event'}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>

        {urgencyLabel && (
          <Badge className="absolute top-1 right-1 bg-red-500 text-white border-none text-[9px] px-1 py-0 leading-4 rounded animate-pulse">
            {urgencyLabel}
          </Badge>
        )}

        {onShare && (
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="absolute top-1 left-1 w-6 h-6 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
          >
            <Share2 className="w-3 h-3 text-gray-700" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div onClick={onCardClick}>
          {/* Title + price */}
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">
              {event.title}
            </h3>
            {!priceInfo.isFree && (
              <span className="text-purple-500 font-medium text-xs whitespace-nowrap flex-shrink-0">
                {priceInfo.display}
              </span>
            )}
          </div>

          {/* Date + location */}
          <p className="text-xs text-muted-foreground mb-1">
            {formatEventDateTime(event.date, event.time)} · {getLocationDisplay(event.venue, event.location)}
          </p>

          {/* Social proof */}
          <div className="flex items-center gap-1.5 mb-2">
            {friends.length > 0 && (
              <div className="flex -space-x-1">
                {friends.slice(0, 3).map((friend) => (
                  <div
                    key={friend.id}
                    className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[8px] font-medium text-white border border-card overflow-hidden"
                  >
                    {friend.avatar
                      ? <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                      : friend.name.charAt(0).toUpperCase()
                    }
                  </div>
                ))}
              </div>
            )}
            <span className="text-[11px] text-muted-foreground">
              {getSocialProofText(friends, totalParticipants)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className={`flex-1 h-8 text-xs font-medium ${
              isParticipating
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white'
            }`}
            onClick={(e) => { e.stopPropagation(); onParticipate(); }}
          >
            {isParticipating ? '✅ Inscrit' : 'Participer'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`w-8 h-8 p-0 flex-shrink-0 border ${
              isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'border-border'
            }`}
            onClick={(e) => { e.stopPropagation(); onLike(); }}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EventListCard;
