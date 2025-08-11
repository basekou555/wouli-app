import React from 'react';
import { Navigation, Copy } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';

interface EventLocationSectionProps {
  event: UnifiedEvent;
  onOpenMaps: (location: string) => void;
  onCopyAddress: (location: string) => void;
}

const EventLocationSection: React.FC<EventLocationSectionProps> = ({ 
  event, 
  onOpenMaps, 
  onCopyAddress 
}) => {
  const venueName = event.venue || (event as any).custom_venue || 'Lieu à confirmer';
  const address = event.address || event.location;

  return (
    <div className="px-6 py-4 border-t bg-white">
      <h2 className="text-lg font-semibold mb-3">Lieu</h2>
      
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{venueName}</h3>
            <p className="text-sm text-gray-600 mt-1">{address}</p>
          </div>
        </div>
        
        {/* Actions lieu */}
        <div className="flex gap-2">
          <button 
            onClick={() => onOpenMaps(address)}
            className="flex-1 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <Navigation className="w-4 h-4" />
            Itinéraire
          </button>
          <button 
            onClick={() => onCopyAddress(address)}
            className="flex-1 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <Copy className="w-4 h-4" />
            Copier
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventLocationSection;