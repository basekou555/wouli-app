import React from 'react';
import { Clock } from 'lucide-react';

interface PreciseTimeIndicatorProps {
  eventDate: string;
  eventTime?: string;
  className?: string;
}

const PreciseTimeIndicator: React.FC<PreciseTimeIndicatorProps> = ({ 
  eventDate, 
  eventTime,
  className = '' 
}) => {
  const [timeUntil, setTimeUntil] = React.useState<string>('');

  React.useEffect(() => {
    const updateTimeUntil = () => {
      const now = new Date();
      const eventDateTime = new Date(`${eventDate}${eventTime ? `T${eventTime}` : ''}`);
      const diffMs = eventDateTime.getTime() - now.getTime();
      
      if (diffMs < 0) {
        setTimeUntil('Terminé');
        return;
      }

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 60) {
        setTimeUntil(`Dans ${diffMinutes} min`);
      } else if (diffHours < 24) {
        setTimeUntil(`Dans ${diffHours}h`);
      } else if (diffDays < 7) {
        setTimeUntil(`Dans ${diffDays}j`);
      } else {
        const dayName = eventDateTime.toLocaleDateString('fr-FR', { weekday: 'long' });
        setTimeUntil(dayName);
      }
    };

    updateTimeUntil();
    const interval = setInterval(updateTimeUntil, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  return (
    <div className={`flex items-center gap-1 text-muted-foreground ${className}`}>
      <Clock className="w-3 h-3" />
      <span className="text-xs font-medium">{timeUntil}</span>
    </div>
  );
};

export default PreciseTimeIndicator;