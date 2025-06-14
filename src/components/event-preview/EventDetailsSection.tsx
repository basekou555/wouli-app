
import React from 'react';
import { Calendar, MapPin, Clock, Euro } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { formatEventDate } from '@/utils/dateFormatting';

interface EventDetailsSectionProps {
  event: UnifiedEvent;
}

const EventDetailsSection: React.FC<EventDetailsSectionProps> = ({ event }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Détails de l'événement</h2>
        {event.description && (
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center text-gray-700">
          <Calendar className="h-5 w-5 mr-3 text-orange-500" />
          <span>{formatEventDate(event.date)}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <MapPin className="h-5 w-5 mr-3 text-orange-500" />
          <span>{event.location}</span>
        </div>

        {event.time && (
          <div className="flex items-center text-gray-700">
            <Clock className="h-5 w-5 mr-3 text-orange-500" />
            <span>{event.time}</span>
          </div>
        )}

        {event.price_text && (
          <div className="flex items-center text-gray-700">
            <Euro className="h-5 w-5 mr-3 text-orange-500" />
            <span>{event.price_text}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsSection;
