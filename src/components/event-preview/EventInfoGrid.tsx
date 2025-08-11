import React from 'react';
import { Euro, Clock, Timer } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { getCategoryIcon, getCategoryName } from '@/data/wouliCategories';
import { formatPrice } from '@/utils/eventDetailHelpers';

interface EventInfoGridProps {
  event: UnifiedEvent;
}

const EventInfoGrid: React.FC<EventInfoGridProps> = ({ event }) => {
  const infos = [
    {
      icon: <Euro className="w-5 h-5 text-purple-600" />,
      bgColor: 'bg-purple-100',
      label: 'Prix',
      value: formatPrice(event.price_text || (event as any).price)
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      bgColor: 'bg-blue-100',
      label: 'Horaires',
      value: event.time || 'À confirmer'
    },
    {
      icon: <span className="text-lg">{getCategoryIcon(event.event_type || event.category)}</span>,
      bgColor: 'bg-green-100',
      label: 'Type',
      value: getCategoryName(event.event_type || event.category)
    }
  ];

  // Ajouter durée si disponible
  if ((event as any).duration) {
    infos.push({
      icon: <Timer className="w-5 h-5 text-orange-600" />,
      bgColor: 'bg-orange-100',
      label: 'Durée',
      value: (event as any).duration
    });
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {infos.map((info, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className={`w-10 h-10 ${info.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
            {info.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">{info.label}</p>
            <p className="text-sm text-gray-600 break-words">{info.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventInfoGrid;