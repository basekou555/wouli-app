import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedEvent } from '@/types/unified';
import { EventListItem } from './EventListItem';
import { formatDistanceToNow, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ParticipationsTabProps {
  events: UnifiedEvent[];
  onRemove: (eventId: string) => void;
  loading?: boolean;
}

export const ParticipationsTab: React.FC<ParticipationsTabProps> = ({ 
  events, 
  onRemove,
  loading = false 
}) => {
  const navigate = useNavigate();

  // Filtrer uniquement les événements futurs
  const upcomingEvents = events.filter(e => !isPast(new Date(e.date)));
  
  const getCountdown = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { locale: fr, addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 px-4 py-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-xl h-24 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Calendar className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-2">Aucune participation</p>
        <p className="text-muted-foreground text-sm mb-4">
          Confirme ta participation à un événement pour planifier ta sortie
        </p>
        <Button 
          onClick={() => navigate('/app')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
        >
          Découvrir des événements
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium text-foreground">
          À venir ({upcomingEvents.length})
        </span>
      </div>
      
      <div className="space-y-3">
        {upcomingEvents.map(event => (
          <EventListItem 
            key={event.id}
            event={event}
            badge={
              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
                {getCountdown(event.date)}
              </Badge>
            }
            showAddToCalendar
            showRemove
            onRemove={() => onRemove(event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipationsTab;
