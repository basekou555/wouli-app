import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, X, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnifiedEvent } from '@/types/unified';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventListItemProps {
  event: UnifiedEvent;
  badge?: React.ReactNode;
  compact?: boolean;
  showAddToCalendar?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event,
  badge,
  compact = false,
  showAddToCalendar = false,
  showRemove = false,
  onRemove
}) => {
  const navigate = useNavigate();

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'd MMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  };

  const addToCalendar = () => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // +2h par défaut
    
    const title = encodeURIComponent(event.title);
    const location = encodeURIComponent(event.location || event.venue || '');
    const details = encodeURIComponent(event.description || '');
    const dates = `${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="bg-card rounded-xl overflow-hidden border border-border flex gap-3 cursor-pointer"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Thumbnail */}
      <img 
        src={event.image_url || '/placeholder.svg'} 
        alt={event.title}
        className="w-24 h-24 object-cover flex-shrink-0"
      />
      
      {/* Infos */}
      <div className="flex-1 py-3 pr-2 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground flex-1">
            {event.title}
          </h3>
          {badge}
        </div>
        
        {!compact && (
          <>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              {formatDate(event.date)}
              {event.time && ` • ${event.time.slice(0, 5)}`}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{event.location || event.venue}</span>
            </p>
          </>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex flex-col justify-center gap-1 pr-2">
        {showAddToCalendar && (
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              addToCalendar();
            }}
          >
            <CalendarPlus className="w-4 h-4" />
          </Button>
        )}
        
        {showRemove && onRemove && (
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => { 
              e.stopPropagation(); 
              onRemove(); 
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EventListItem;
