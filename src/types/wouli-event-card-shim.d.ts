
declare module "@/components/cards/WouliEventCard" {
  import React from "react";
  import type { UnifiedEvent } from "@/types/unified";

  export interface WouliEventCardProps {
    event: UnifiedEvent;
    isLiked?: boolean;
    isParticipating?: boolean;
    onLike?: () => void;
    onParticipate?: () => void;
    onShare?: () => void;
    onCardClick?: () => void;
    className?: string;
    // Allow optional variant prop used by SearchResults without breaking types
    variant?: string;
    // Accept any additional props to avoid strict type errors from external usages
    [key: string]: any;
  }

  const WouliEventCard: React.FC<WouliEventCardProps>;
  export default WouliEventCard;
}
