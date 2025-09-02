import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Heart, HeartOff, PlusCircle, MinusCircle } from 'lucide-react';
import { getUrgencyBadge, formatEventDateTime, getPriceDisplay, getLocationDisplay } from '@/utils/eventCardHelpers';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UnifiedEvent } from '@/types/unified';
import { useSimpleEventInteractions } from '@/hooks/useSimpleEventInteractions';
import SocialProof from './SocialProof';

interface WouliEventCardProps {
  event: UnifiedEvent;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const WouliEventCard: React.FC<WouliEventCardProps> = ({ event, onSwipeLeft, onSwipeRight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { handleLike, handleUnlike, handleParticipate, handleCancelParticipation } = useSimpleEventInteractions();

  const urgencyBadge = getUrgencyBadge(event.date, event.time);
  const eventDateTime = formatEventDateTime(event.date, event.time);
  const priceDisplay = getPriceDisplay(event.price_text);
  const locationDisplay = getLocationDisplay(event.venue, event.location);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLikeClick = async () => {
    if (event.id) {
      if (event.likes > 0) {
        await handleUnlike(event.id, event.title);
      } else {
        await handleLike(event.id, event.title);
      }
    }
  };

  const handleParticipateClick = async () => {
    if (event.id) {
      if (event.participants > 0) {
        await handleCancelParticipation(event.id, event.title);
      } else {
        await handleParticipate(event.id, event.title);
      }
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm mx-auto h-[600px] flex flex-col">
      {/* Image Section (70%) */}
      <div className="h-[420px] relative">
        <img
          src={event.image_url || `https://picsum.photos/400/500?random=${event.id}`}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {/* Urgency Badge */}
        {urgencyBadge && (
          <Badge className="absolute top-2 left-2 z-10">{urgencyBadge}</Badge>
        )}
      </div>

      {/* Info Section (30%) */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        {/* Title & Basic Info */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">{event.title}</h2>
          <div className="flex items-center text-gray-500 text-sm">
            <Calendar className="h-4 w-4 mr-1.5" />
            {eventDateTime}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin className="h-4 w-4 mr-1.5" />
            {locationDisplay}
          </div>
        </div>

        {/* Social Proof - VERSION AMÉLIORÉE avec vrais amis */}
        <div className="mt-3">
          <SocialProof 
            eventId={event.id}
            totalParticipants={event.participants || 0}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleLikeClick}
            >
              {event.likes > 0 ? (
                <HeartOff className="h-5 w-5" />
              ) : (
                <Heart className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleParticipateClick}
            >
              {event.participants > 0 ? (
                <MinusCircle className="h-5 w-5" />
              ) : (
                <PlusCircle className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">{priceDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WouliEventCard;
