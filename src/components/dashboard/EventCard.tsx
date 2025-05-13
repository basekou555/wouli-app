
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
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group h-full flex flex-col rounded-xl">
      <CardHeader className="px-3 sm:px-4 py-2 sm:py-3 flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Avatar className="h-7 w-7 sm:h-9 sm:w-9 border-2 border-pink-200 shadow-sm">
            <AvatarImage src={event.organizerAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">{event.organizerName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-xs sm:text-sm">{event.organizerName || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-2 w-2 sm:h-3 sm:w-3 mr-1 text-pink-400" />
              {isMobile ? (event.location?.substring(0, 10) || 'Lieu') + '...' : (event.location || 'Lieu non spécifié')}
            </p>
          </div>
        </div>
        {isUpcoming && (
          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-none text-xs px-2 py-0.5">
            À venir
          </Badge>
        )}
      </CardHeader>

      <Link to={`/events/${event.id}`} className="block relative flex-grow">
        <div className="aspect-[4/5] overflow-hidden bg-gray-100">
          <img 
            src={event.image || DEFAULT_EVENT_IMAGE} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
            onError={handleImageError}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="w-full p-4 text-white">
            <span className="text-sm font-medium bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">Voir les détails</span>
          </div>
        </div>
      </Link>

      <CardContent className="py-3 sm:py-4 flex-grow bg-white dark:bg-gray-800">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1">{event.title}</h3>
          </div>

          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 flex-shrink-0 text-pink-500" />
            <span className="text-xs sm:text-sm">
              {formatEventDate(event.date)}
            </span>
          </div>
          
          {event.description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="py-2 sm:py-3 px-3 sm:px-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center mt-auto bg-white dark:bg-gray-800">
        <div className="flex space-x-2 sm:space-x-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-pink-50 hover:text-pink-500 dark:hover:bg-gray-700">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-pink-500 transition-colors" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0 rounded-full hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-gray-700">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-blue-500 transition-colors" />
          </Button>
        </div>
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded-full">
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-purple-500" />
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {(event.participants?.length || 0)} participant{(event.participants?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
