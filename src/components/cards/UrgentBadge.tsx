import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UrgentBadgeProps {
  eventDate: string;
  eventTime?: string;
}

const UrgentBadge: React.FC<UrgentBadgeProps> = ({ eventDate, eventTime }) => {
  const getUrgentLabel = () => {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}${eventTime ? `T${eventTime}` : ''}`);
    const hoursUntil = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil < 1) return "Maintenant";
    if (hoursUntil < 4) return "Dans 2h";
    
    // Check if it's the same day
    const isSameDay = now.toDateString() === eventDateTime.toDateString();
    if (isSameDay) return "Ce soir";
    
    return null;
  };

  const urgentLabel = getUrgentLabel();

  if (!urgentLabel) return null;

  return (
    <Badge 
      className="absolute top-3 right-3 bg-urgent text-urgent-foreground border-none animate-heartbeat text-xs font-medium px-2 py-1 rounded-lg shadow-lg"
    >
      {urgentLabel}
    </Badge>
  );
};

export default UrgentBadge;