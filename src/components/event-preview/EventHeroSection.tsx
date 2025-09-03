
import React from 'react';
import { UnifiedEvent } from '@/types/unified';
import ProxiedImage from '@/components/ProxiedImage';

interface EventHeroSectionProps {
  event: UnifiedEvent;
}

const EventHeroSection: React.FC<EventHeroSectionProps> = ({ event }) => {
  return (
    <div className="relative h-96 w-full bg-black">
      <ProxiedImage
        src={event.image_url || "https://picsum.photos/800/400?random=event"}
        alt={event.title}
        eventId={event.id}
        className="w-full h-full object-contain"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-lg opacity-90">Proposé par {event.organizer}</p>
          {event.source === 'business' && (
            <div className="mt-2">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                ★ Établissement Vérifié
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventHeroSection;
