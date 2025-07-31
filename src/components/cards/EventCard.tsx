import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Share2, Eye, Users } from 'lucide-react';
import { Event, EventCardVariant } from '@/types/event';
import { formatDateTime, getEventStatus, getStatusVariant } from '@/utils/eventHelpers';
import SocialProof from './SocialProof';
import PerformanceBadge from './PerformanceBadge';

interface EventCardProps {
  event: Event;
  variant: EventCardVariant;
  onLike: () => void;
  onParticipate: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onCardClick?: () => void;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  variant,
  onLike,
  onParticipate,
  onDislike,
  onShare,
  onCardClick,
  className = ''
}) => {
  // VARIANTE SWIPE
  if (variant === 'swipe') {
    return (
      <Card className={`max-w-[343px] rounded-xl shadow-xl overflow-hidden bg-card ${className}`}>
        <div className="relative cursor-pointer" onClick={onCardClick}>
          <img 
            src={event.image_url || "https://picsum.photos/400/500?random=event"}
            alt={event.title}
            className="w-full aspect-[4/5] object-cover" 
          />
          {event.isUrgent && (
            <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none animate-pulse">
              Urgent
            </Badge>
          )}
          {onShare && (
            <Button 
              size="sm"
              className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full p-0 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
            >
              <Share2 className="h-4 w-4 text-gray-700" />
            </Button>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          {/* Titre + Prix */}
          <div className="flex justify-between items-start gap-2" onClick={onCardClick}>
            <h3 className="font-bold text-lg text-foreground flex-1 cursor-pointer">{event.title}</h3>
            {!event.isFree && event.price && (
              <span className="text-green-600 font-semibold whitespace-nowrap">{event.price}€</span>
            )}
          </div>
          
          {/* Timing + Lieu */}
          <div className="text-sm text-muted-foreground cursor-pointer" onClick={onCardClick}>
            {formatDateTime(event)} • {event.venue}
          </div>
          
          {/* Social Proof */}
          <div onClick={onCardClick} className="cursor-pointer">
            <SocialProof 
              friendsParticipating={event.friendsParticipating}
              totalParticipants={event.totalParticipants}
            />
          </div>
          
          {/* Actions 3 boutons */}
          <div className="flex gap-3">
            {onDislike && (
              <Button 
                variant="outline" 
                size="sm"
                className="h-11 px-3 bg-muted hover:bg-muted/80"
                onClick={onDislike}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button 
              className={`flex-1 h-11 font-semibold ${
                event.participating 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
              onClick={onParticipate}
            >
              {event.participating ? '✅ Inscrit' : 'Participer'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={`h-11 px-3 ${
                event.liked 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'bg-background hover:bg-muted'
              }`}
              onClick={onLike}
            >
              <Heart className={`h-4 w-4 ${event.liked ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // VARIANTE LIST
  if (variant === 'list') {
    return (
      <Card className={`flex gap-3 p-3 rounded-lg hover:shadow-lg transition-shadow bg-card cursor-pointer ${className}`}>
        <div className="relative flex-shrink-0" onClick={onCardClick}>
          <img 
            src={event.image_url || "https://picsum.photos/400/400?random=event"}
            alt={event.title}
            className="w-24 h-24 rounded-lg object-cover" 
          />
          {event.isUrgent && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div onClick={onCardClick}>
            <h3 className="font-semibold text-base text-foreground truncate mb-1">{event.title}</h3>
            <div className="text-sm text-muted-foreground mb-2">
              {formatDateTime(event)} • {event.venue}
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              {event.totalParticipants} participants
            </div>
          </div>
          
          {/* Actions 2 boutons seulement */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className={`flex-1 text-xs ${
                event.participating 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
              onClick={onParticipate}
            >
              {event.participating ? 'Inscrit' : 'Participer'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className={`px-3 ${
                event.liked 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'hover:bg-muted'
              }`}
              onClick={onLike}
            >
              <Heart className={`h-3 w-3 ${event.liked ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // VARIANTE BUSINESS
  if (variant === 'business') {
    return (
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow bg-card cursor-pointer ${className}`}>
        <div className="flex gap-4 p-4">
          <img 
            src={event.image_url || "https://picsum.photos/400/400?random=event"}
            alt={event.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0" 
            onClick={onCardClick}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-foreground truncate cursor-pointer" onClick={onCardClick}>
                {event.title}
              </h3>
              <PerformanceBadge event={event} />
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground mb-3" onClick={onCardClick}>
              <div>{formatDateTime(event)} • {event.venue}</div>
              <div className="flex items-center gap-4">
                {event.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {event.views}
                  </span>
                )}
                {event.likes !== undefined && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {event.likes}
                  </span>
                )}
                {event.participants !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.participants}
                  </span>
                )}
                {event.conversion_rate && (
                  <span>📊 {(event.conversion_rate * 100).toFixed(1)}%</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Badge variant={getStatusVariant(event)}>
                {getEventStatus(event)}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Modifier</Button>
                <Button size="sm" variant="outline">Stats</Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default EventCard;