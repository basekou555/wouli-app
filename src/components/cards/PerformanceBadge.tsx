import React from 'react';
import { Event } from '@/types/event';
import { getPerformanceBadge } from '@/utils/eventHelpers';

interface PerformanceBadgeProps {
  event: Event;
  className?: string;
}

const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({ event, className = '' }) => {
  const badge = getPerformanceBadge(event);
  
  return (
    <span className={`text-lg ${className}`}>
      {badge}
    </span>
  );
};

export default PerformanceBadge;