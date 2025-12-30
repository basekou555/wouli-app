import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GroupedViews } from '@/hooks/useEventViews';
import { EventListItem } from './EventListItem';

interface HistoryTabProps {
  groupedViews: GroupedViews[];
  loading?: boolean;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ 
  groupedViews,
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

  if (groupedViews.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Eye className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium mb-2">Aucun historique</p>
        <p className="text-muted-foreground text-sm mb-4">
          Les événements consultés apparaîtront ici
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
      {groupedViews.map(group => (
        <div key={group.label} className="mb-6 last:mb-0">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {group.label} ({group.views.length})
            </span>
          </div>
          
          <div className="space-y-2">
            {group.views.map((view, index) => (
              <EventListItem 
                key={`${view.event.id}-${index}`}
                event={view.event}
                compact
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryTab;
