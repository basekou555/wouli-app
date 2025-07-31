import React from 'react';
import { UnifiedEvent } from '@/types/unified';
import { getPerformanceBadge } from '@/utils/eventHelpers';

interface PerformanceBadgeProps {
  event: UnifiedEvent;
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