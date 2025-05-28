
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { EventData } from '../../services/eventService';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, MapPin, Users } from 'lucide-react';

// Constants
const DEFAULT_EVENT_IMAGE = '/assets/images/event-placeholder.jpg';

interface EventCardProps {
  event: EventData;
  isUpcomingEvent: (date: any) => boolean;
  formatEventDate: (date: any) => string;
}

const EventCard: React.FC<EventCardProps> = ({ event, isUpcomingEvent, formatEventDate }) => {
  const isUpcoming = isUpcomingEvent(event.date);
  
  return (
    <Card className="overflow-hidden border-gray-100 hover:shadow-md transition-all group">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8 border border-gray-100">
            <AvatarImage src={event.organizerAvatar} />
            <AvatarFallback>{event.organizerName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{event.organizerName || 'Utilisateur'}</p>
            <p className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              {event.location || 'Lieu non spécifié'}
            </p>
          </div>
        </div>
        {isUpcoming && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            À venir
          </Badge>
        )}
      </CardHeader>

      <Link to={`/events/${event.id}`} className="block relative">
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <img 
            src={event.image || DEFAULT_EVENT_IMAGE} 
            alt={event.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_EVENT_IMAGE;
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="w-full p-4 text-white">
            <span className="text-sm font-medium">Voir les détails</span>
          </div>
        </div>
      </Link>

      <CardContent className="py-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
          </div>

          <div className="flex items-center text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">
              {formatEventDate(event.date)}
            </span>
          </div>
          
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="py-3 px-4 border-t border-gray-50 flex justify-between items-center">
        <div className="flex space-x-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <Heart className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <Share2 className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1 text-gray-400" />
          <span className="text-xs text-gray-600 font-medium">
            {(event.participants?.length || 0)} participant{(event.participants?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
