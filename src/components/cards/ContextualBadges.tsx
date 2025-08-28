import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Repeat, Gift } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';

interface ContextualBadgesProps {
  event: UnifiedEvent;
  className?: string;
}

const ContextualBadges: React.FC<ContextualBadgesProps> = ({ event, className = '' }) => {
  const badges = [];

  // Free badge
  const isFree = !event.price_text || 
    event.price_text.toLowerCase().includes('gratuit') || 
    event.price_text === '0€';
  
  if (isFree) {
    badges.push({
      key: 'free',
      label: 'Gratuit',
      icon: Gift,
      variant: 'success' as const,
      priority: 1
    });
  }

  // Capacity badge
  if (event.capacity && event.participants >= event.capacity * 0.9) {
    badges.push({
      key: 'full',
      label: 'Presque complet',
      icon: Users,
      variant: 'urgent' as const,
      priority: 2
    });
  }

  // New event badge (created less than 7 days ago)
  if (event.created_at) {
    const daysSinceCreation = (Date.now() - new Date(event.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) {
      badges.push({
        key: 'new',
        label: 'Nouveau',
        icon: Star,
        variant: 'default' as const,
        priority: 3
      });
    }
  }

  // Recurring event badge
  if (event.source === 'business' && 'is_recurring' in event && event.is_recurring) {
    badges.push({
      key: 'recurring',
      label: 'Récurrent',
      icon: Repeat,
      variant: 'secondary' as const,
      priority: 4
    });
  }

  // Sort by priority and take top 2
  const visibleBadges = badges
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2);

  if (visibleBadges.length === 0) return null;

  return (
    <div className={`flex gap-1 flex-wrap ${className}`}>
      {visibleBadges.map(({ key, label, icon: Icon, variant }) => (
        <Badge 
          key={key}
          variant={variant}
          className="text-xs h-5 px-2 gap-1"
        >
          <Icon className="w-3 h-3" />
          {label}
        </Badge>
      ))}
    </div>
  );
};

export default ContextualBadges;