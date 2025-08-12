import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Medal, Target } from 'lucide-react';

interface BenchmarkBadgeProps {
  position: number;
  total: number;
  category?: string;
  className?: string;
}

const BenchmarkBadge: React.FC<BenchmarkBadgeProps> = ({
  position,
  total,
  category,
  className = ''
}) => {
  const getPercentile = () => {
    if (total === 0) return 0;
    return Math.round(((total - position + 1) / total) * 100);
  };

  const getBadgeVariant = () => {
    const percentile = getPercentile();
    if (percentile >= 80) return 'default'; // Top 20%
    if (percentile >= 60) return 'secondary'; // Top 40%
    return 'outline'; // Below median
  };

  const getIcon = () => {
    const percentile = getPercentile();
    if (percentile >= 90) return <Trophy className="h-3 w-3" />;
    if (percentile >= 80) return <Award className="h-3 w-3" />;
    if (percentile >= 60) return <Medal className="h-3 w-3" />;
    return <Target className="h-3 w-3" />;
  };

  const getText = () => {
    const percentile = getPercentile();
    
    if (position === 1) {
      return `#1 sur ${total}`;
    }
    
    if (percentile >= 90) {
      return `Top ${Math.round((position / total) * 100)}%`;
    }
    
    return `#${position} sur ${total}`;
  };

  const getDescription = () => {
    if (category) {
      return `${category}`;
    }
    return 'événements similaires';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getBadgeVariant()} className="flex items-center gap-1 px-2 py-1">
        {getIcon()}
        <span className="font-medium">{getText()}</span>
      </Badge>
      <span className="text-xs text-muted-foreground">
        {getDescription()}
      </span>
    </div>
  );
};

export default BenchmarkBadge;