import React from 'react';
import { UnifiedEvent } from '@/types/unified';

interface EventStatsRecurrentProps {
  event: UnifiedEvent;
}

const EventStatsRecurrent: React.FC<EventStatsRecurrentProps> = ({ event }) => {
  // Vérifier si c'est un événement récurrent
  const isRecurrent = (event as any).is_recurring && (event as any).total_editions > 1;
  
  if (!isRecurrent) {
    return null;
  }

  const stats = [
    {
      value: (event as any).total_editions || 1,
      label: 'éditions'
    },
    {
      value: (event as any).avg_attendance || '~50',
      label: 'participants/édition'
    },
    {
      value: `${(event as any).satisfaction_rate || '95'}%`,
      label: 'satisfaction'
    }
  ];

  return (
    <div className="px-6 py-4 border-t bg-white">
      <h3 className="text-lg font-semibold mb-3">En chiffres</h3>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventStatsRecurrent;