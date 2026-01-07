import React from 'react';
import { cn } from '@/lib/utils';

interface RecommendationBadgeProps {
  badge: string;
  className?: string;
}

const getBadgeStyle = (badge: string): string => {
  // Urgency badges - red/orange
  if (badge.includes('Ce soir') || badge.includes('🔥')) {
    return 'bg-gradient-to-r from-orange-500 to-red-500 text-white';
  }
  
  // Social badges - blue
  if (badge.includes('ami') || badge.includes('👥')) {
    return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
  }
  
  // Preference match - pink/purple
  if (badge.includes('Pour toi') || badge.includes('❤️')) {
    return 'bg-gradient-to-r from-pink-500 to-purple-500 text-white';
  }
  
  // Trending - green
  if (badge.includes('Populaire') || badge.includes('📈')) {
    return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
  }
  
  // Default
  return 'bg-primary/20 text-primary';
};

export const RecommendationBadge: React.FC<RecommendationBadgeProps> = ({ badge, className }) => {
  return (
    <span 
      className={cn(
        'px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm',
        getBadgeStyle(badge),
        className
      )}
    >
      {badge}
    </span>
  );
};

interface RecommendationBadgesProps {
  badges: string[];
  maxBadges?: number;
  className?: string;
}

export const RecommendationBadges: React.FC<RecommendationBadgesProps> = ({ 
  badges, 
  maxBadges = 3,
  className 
}) => {
  if (!badges || badges.length === 0) return null;

  const displayBadges = badges.slice(0, maxBadges);

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {displayBadges.map((badge, index) => (
        <RecommendationBadge key={index} badge={badge} />
      ))}
    </div>
  );
};

export default RecommendationBadges;
