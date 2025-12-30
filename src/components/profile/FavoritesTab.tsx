import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedEvent } from '@/types/unified';
import { EventListItem } from './EventListItem';

interface FavoritesTabProps {
  events: UnifiedEvent[];
  onRemove: (eventId: string) => void;
  loading?: boolean;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({ 
  events, 
  onRemove,
  loading = false 
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-3 px-4 py-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-xl h-24 animate-pulse border border-border" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Heart className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-2">Aucun favori</p>
        <p className="text-muted-foreground text-sm mb-4">
          Like des événements pour les retrouver ici
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
    <div className="space-y-3 px-4 py-4">
      {events.map(event => (
        <EventListItem 
          key={event.id}
          event={event}
          showRemove
          onRemove={() => onRemove(event.id)}
        />
      ))}
    </div>
  );
};

export default FavoritesTab;
