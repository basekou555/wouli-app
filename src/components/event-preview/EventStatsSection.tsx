
import React from 'react';
import { UnifiedEvent } from '@/types/unified';

interface EventStatsSectionProps {
  event: UnifiedEvent;
}

const EventStatsSection: React.FC<EventStatsSectionProps> = ({ event }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Engagement</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-500">{event.views}</div>
          <div className="text-sm text-gray-600">Vues</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-500">{event.likes}</div>
          <div className="text-sm text-gray-600">Likes</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">{event.participants}</div>
          <div className="text-sm text-gray-600">Participants</div>
        </div>
      </div>
    </div>
  );
};

export default EventStatsSection;
