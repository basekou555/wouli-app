import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X } from 'lucide-react';

interface EventActionsProps {
  onDislike: () => void;
  onParticipate: () => void;
  onLike: () => void;
  isLiked: boolean;
  isParticipating: boolean;
  disabled?: boolean;
}

const EventActions: React.FC<EventActionsProps> = ({
  onDislike,
  onParticipate,
  onLike,
  isLiked,
  isParticipating,
  disabled = false
}) => {
  return (
    <div className="flex space-x-2 w-full">
      {/* Dislike Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onDislike}
        disabled={disabled}
        className="h-11 px-3 bg-muted hover:bg-muted/80 border-border"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Participate Button */}
      <Button
        onClick={onParticipate}
        disabled={disabled || isParticipating}
        className={`flex-1 h-11 font-semibold ${
          isParticipating 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
        }`}
      >
        {isParticipating ? '✅ Inscrit' : 'Participer'}
      </Button>

      {/* Like Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onLike}
        disabled={disabled}
        className={`h-11 px-3 ${
          isLiked 
            ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
            : 'bg-background hover:bg-muted border-border'
        }`}
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
      </Button>
    </div>
  );
};

export default EventActions;