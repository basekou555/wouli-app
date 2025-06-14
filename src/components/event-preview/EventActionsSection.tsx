
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';

interface EventActionsSectionProps {
  event: UnifiedEvent;
  onParticipate: () => void;
}

const EventActionsSection: React.FC<EventActionsSectionProps> = ({ event, onParticipate }) => {
  return (
    <div className="space-y-4">
      <Button 
        onClick={onParticipate}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
        size="lg"
      >
        <Users className="h-5 w-5 mr-2" />
        Je participe !
      </Button>

      {event.external_url && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.open(event.external_url, '_blank')}
        >
          <ExternalLink className="h-5 w-5 mr-2" />
          Plus d'infos
        </Button>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">
          Découvrez plus d'événements sur
        </p>
        <div className="text-2xl font-bold text-orange-500">Wouli</div>
        <p className="text-xs text-gray-500">L'app pour découvrir et partager des sorties</p>
      </div>
    </div>
  );
};

export default EventActionsSection;
