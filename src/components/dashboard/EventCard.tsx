
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { EventData } from '../../services/eventService';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, MapPin, Users, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Constants
const DEFAULT_EVENT_IMAGE = '/assets/images/event-placeholder.jpg';

interface EventCardProps {
  event: EventData;
  isUpcomingEvent: (date: any) => boolean;
  formatEventDate: (date: any) => string;
}

const EventCard: React.FC<EventCardProps> = ({ event, isUpcomingEvent, formatEventDate }) => {
  const isUpcoming = isUpcomingEvent(event.date);
  const isMobile = useIsMobile();
  
  // Fonction de gestion d'erreur de chargement d'image
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = DEFAULT_EVENT_IMAGE;
    target.onerror = null; // Prevent infinite error loop
  }, []);
  
  return (
    <Card className="overflow-hidden border-gray-100 hover:shadow-md transition-all group h-full flex flex-col">
      <CardHeader className="px-3 sm:px-4 py-2 sm:py-3 flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 border border-gray-100">
            <AvatarImage src={event.organizerAvatar} />
            <AvatarFallback>{event.organizerName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-xs sm:text-sm">{event.organizerName || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              {isMobile ? (event.location?.substring(0, 10) || 'Lieu') + '...' : (event.location || 'Lieu non spécifié')}
            </p>
          </div>
        </div>
        {isUpcoming && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs px-1.5 py-0.5">
            À venir
          </Badge>
        )}
      </CardHeader>

      <Link to={`/events/${event.id}`} className="block relative flex-grow">
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <img 
            src={event.image || DEFAULT_EVENT_IMAGE} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            onError={handleImageError}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="w-full p-4 text-white">
            <span className="text-sm font-medium">Voir les détails</span>
          </div>
        </div>
      </Link>

      <CardContent className="py-3 sm:py-4 flex-grow">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">{event.title}</h3>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {formatEventDate(event.date)}
            </span>
          </div>
          
          {event.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="py-2 sm:py-3 px-3 sm:px-4 border-t border-gray-50 flex justify-between items-center mt-auto">
        <div className="flex space-x-2 sm:space-x-4">
          <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full">
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
          </Button>
        </div>
        <div className="flex items-center">
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-gray-400" />
          <span className="text-xs text-gray-600 font-medium">
            {(event.participants?.length || 0)} participant{(event.participants?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
