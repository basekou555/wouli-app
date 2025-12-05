import React from 'react';
import { Calendar, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventListEmptyProps {
  variant: 'upcoming' | 'past';
  onCreateEvent?: () => void;
}

export default function EventListEmpty({ variant, onCreateEvent }: EventListEmptyProps) {
  const isUpcoming = variant === 'upcoming';

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
        isUpcoming 
          ? 'bg-emerald-500/10' 
          : 'bg-slate-500/10'
      }`}>
        {isUpcoming ? (
          <Calendar className="h-7 w-7 text-emerald-500" />
        ) : (
          <History className="h-7 w-7 text-slate-500" />
        )}
      </div>
      
      <h3 className="text-base font-medium text-foreground mb-1">
        {isUpcoming 
          ? "Aucun événement à venir" 
          : "Aucun événement passé"
        }
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {isUpcoming 
          ? "Créez votre prochain événement pour le voir apparaître ici" 
          : "Vos événements passés apparaîtront ici pour analyser leurs performances"
        }
      </p>

      {isUpcoming && onCreateEvent && (
        <Button 
          onClick={onCreateEvent}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un événement
        </Button>
      )}
    </div>
  );
}
