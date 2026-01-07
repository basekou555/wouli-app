import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, List } from 'lucide-react';

interface FeedModeToggleProps {
  mode: 'recommended' | 'all';
  onModeChange: (mode: 'recommended' | 'all') => void;
  className?: string;
}

const FeedModeToggle: React.FC<FeedModeToggleProps> = ({ mode, onModeChange, className }) => {
  return (
    <div className={cn('flex bg-muted rounded-full p-1', className)}>
      <button
        onClick={() => onModeChange('recommended')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          mode === 'recommended'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Sparkles className="w-4 h-4" />
        Pour toi
      </button>
      <button
        onClick={() => onModeChange('all')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
          mode === 'all'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <List className="w-4 h-4" />
        Tous
      </button>
    </div>
  );
};

export default FeedModeToggle;
