
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Heart, Building } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { getCategoryIcon } from '@/data/wouliCategories';

interface EventCardProps {
  event: UnifiedEvent;
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={event.image_url || "https://picsum.photos/200/200?random=event"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
              <div className="flex gap-1 ml-2">
                <Badge variant="outline" className="text-xs">
                  {getCategoryIcon(event.category)}
                </Badge>
                {event.source === 'business' && (
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    ★
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Building className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">Proposé par {event.organizer}</span>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {event.participants} participants
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLike}
                  disabled={isLiked}
                  className="h-8"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  {isLiked ? 'Aimé' : 'J\'aime'}
                </Button>
                <Button
                  size="sm"
                  onClick={onParticipate}
                  disabled={isParticipating}
                  className="h-8"
                >
                  {isParticipating ? '✅ Inscrit' : 'Participer'}
                </Button>
              </div>
              {event.price_text && (
                <Badge variant="secondary" className="text-green-600">
                  {event.price_text}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default EventCard;
