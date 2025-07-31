import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Share2, Eye, Users } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';

export type EventCardVariant = 'swipe' | 'list' | 'business';

interface WouliEventCardProps {
  event: UnifiedEvent;
  variant: EventCardVariant;
  isLiked: boolean;
  isParticipating: boolean;
  onLike: () => void;
  onParticipate: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onCardClick?: () => void;
  className?: string;
  enableSwipe?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const WouliEventCard: React.FC<WouliEventCardProps> = ({
  event,
  variant,
  isLiked,
  isParticipating,
  onLike,
  onParticipate,
  onDislike,
  onShare,
  onCardClick,
  className = '',
  enableSwipe = false,
  onSwipeLeft,
  onSwipeRight
}) => {
  const formatDateTime = () => {
    const date = new Date(event.date);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    let dateText = '';
    if (isToday) dateText = 'Aujourd\'hui';
    else if (isTomorrow) dateText = 'Demain';
    else {
      dateText = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    }
    
    const timeText = event.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `${dateText} ${timeText}`;
  };

  const getLocationText = () => {
    return event.venue || event.location?.split(',')[0].trim() || 'Lieu non spécifié';
  };

  const getPriceText = () => {
    if (!event.price_text) return 'Gratuit';
    if (event.price_text.toLowerCase().includes('gratuit') || event.price_text === '0€') return 'Gratuit';
    return event.price_text;
  };

  const getSocialText = () => {
    const friends = event.friendsParticipating || [];
    const total = event.totalParticipants || event.participants || 0;
    
    if (friends.length > 0) {
      if (friends.length === 1) {
        return `${friends[0].name} + ${total - 1} autres`;
      }
      return `${friends.length} amis + ${total - friends.length} autres`;
    } else if (total > 10) {
      return `${total} personnes intéressées`;
    } else if (total > 0) {
      return `${total} ${total === 1 ? 'personne' : 'personnes'} intéressées`;
    } else {
      return "Sois le premier de tes amis";
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (!enableSwipe) return;
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset > 100 || velocity > 500) {
      onSwipeRight?.();
    } else if (offset < -100 || velocity < -500) {
      onSwipeLeft?.();
    }
  };

  // Card content for swipe variant
  const SwipeCardContent = () => (
    <>
      <div className="relative cursor-pointer" onClick={onCardClick}>
        <img 
          src={event.image_url || "https://picsum.photos/400/500?random=event"}
          alt={event.title}
          className="w-full aspect-[4/5] object-cover" 
        />
        {event.isUrgent && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white border-none animate-pulse">
            Ce soir
          </Badge>
        )}
        {onShare && (
          <Button 
            size="sm"
            className="absolute top-3 left-3 w-10 h-10 bg-card/90 backdrop-blur rounded-full p-0 hover:bg-card border-border/50"
            onClick={(e) => {
              e.stopPropagation();
              onShare();
            }}
          >
            <Share2 className="h-4 w-4 text-foreground" />
          </Button>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        {/* Titre + Prix */}
        <div className="flex justify-between items-start gap-2" onClick={onCardClick}>
          <h3 className="font-bold text-lg text-foreground flex-1 cursor-pointer">{event.title}</h3>
          <span className="text-gradient-primary font-semibold whitespace-nowrap">{getPriceText()}</span>
        </div>
        
        {/* Timing + Lieu */}
        <div className="text-sm text-muted-foreground cursor-pointer" onClick={onCardClick}>
          {formatDateTime()} • {getLocationText()}
        </div>
        
        {/* Social Proof */}
        <div onClick={onCardClick} className="cursor-pointer">
          <div className="flex items-center space-x-2">
            {event.friendsParticipating && event.friendsParticipating.length > 0 && (
              <div className="flex -space-x-1">
                {event.friendsParticipating.slice(0, 3).map((friend) => (
                  <div key={friend.id} className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-medium text-white border-2 border-card">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      friend.name.charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {getSocialText()}
            </span>
          </div>
        </div>
        
        {/* Actions 3 boutons */}
        <div className="flex gap-3">
          {onDislike && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-11 px-3 bg-muted hover:bg-muted/80"
              onClick={onDislike}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button 
            className={`flex-1 h-11 font-semibold ${
              isParticipating 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gradient-primary hover:opacity-90 text-white transition-all hover-scale'
            }`}
            onClick={onParticipate}
          >
            {isParticipating ? '✅ Inscrit' : 'Participer'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={`h-11 px-3 transition-all hover-scale ${
              isLiked 
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                : 'bg-background hover:bg-muted'
            }`}
            onClick={onLike}
          >
            <Heart className={`h-4 w-4 transition-transform ${isLiked ? 'fill-current text-red-500 animate-scale-in' : ''}`} />
          </Button>
        </div>
      </div>
    </>
  );

  // VARIANTE SWIPE
  if (variant === 'swipe') {
    return enableSwipe ? (
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05 }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className={`max-w-[343px] rounded-xl shadow-xl overflow-hidden bg-card ${className}`}>
          <SwipeCardContent />
        </Card>
      </motion.div>
    ) : (
      <Card className={`max-w-[343px] rounded-xl shadow-xl overflow-hidden bg-card ${className}`}>
        <SwipeCardContent />
      </Card>
    );
  }

  // VARIANTE LIST
  if (variant === 'list') {
    return (
      <Card className={`flex gap-3 p-3 rounded-lg hover:shadow-lg transition-all duration-300 bg-card cursor-pointer hover-scale ${className}`}>
        <div className="relative flex-shrink-0" onClick={onCardClick}>
          <img 
            src={event.image_url || "https://picsum.photos/400/300?random=event"}
            alt={event.title}
            className="w-24 h-16 rounded-lg object-cover" 
          />
          {event.isUrgent && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div onClick={onCardClick}>
            <h3 className="font-semibold text-base text-foreground truncate mb-1">{event.title}</h3>
            <div className="text-sm text-muted-foreground mb-1">
              {formatDateTime()} • {getLocationText()}
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              {getSocialText()}
            </div>
          </div>
          
          {/* Actions 2 boutons seulement */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className={`flex-1 text-xs transition-all ${
                isParticipating 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-primary hover:opacity-90 text-white'
              }`}
              onClick={onParticipate}
            >
              {isParticipating ? 'Inscrit' : 'Participer'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className={`px-3 transition-all ${
                isLiked 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'hover:bg-muted'
              }`}
              onClick={onLike}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // VARIANTE BUSINESS
  if (variant === 'business') {
    const getPerformanceBadge = () => {
      const conversion = event.conversion_rate;
      if (!conversion) return '📊';
      if (conversion > 0.3) return '🔥';
      if (conversion > 0.2) return '⚡';
      if (conversion > 0.1) return '📊';
      return '📉';
    };

    const getEventStatus = () => {
      const now = new Date();
      const eventDate = new Date(event.date);
      
      if (eventDate > now) return 'À venir';
      if (eventDate.toDateString() === now.toDateString()) return 'En cours';
      return 'Terminé';
    };

    const getStatusVariant = (): "default" | "secondary" | "destructive" => {
      const status = getEventStatus();
      switch (status) {
        case 'À venir': return 'default';
        case 'En cours': return 'secondary';
        case 'Terminé': return 'destructive';
        default: return 'default';
      }
    };

    return (
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow bg-card cursor-pointer ${className}`}>
        <div className="flex gap-4 p-4">
          <img 
            src={event.image_url || "https://picsum.photos/400/400?random=event"}
            alt={event.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0" 
            onClick={onCardClick}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-foreground truncate cursor-pointer" onClick={onCardClick}>
                {event.title}
              </h3>
              <span className="text-lg">{getPerformanceBadge()}</span>
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground mb-3" onClick={onCardClick}>
              <div>{formatDateTime()} • {getLocationText()}</div>
              <div className="flex items-center gap-4">
                {event.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {event.views}
                  </span>
                )}
                {event.likes !== undefined && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {event.likes}
                  </span>
                )}
                {event.participants !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.participants}
                  </span>
                )}
                {event.conversion_rate && (
                  <span>📊 {(event.conversion_rate * 100).toFixed(1)}%</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Badge variant={getStatusVariant()}>
                {getEventStatus()}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Modifier</Button>
                <Button size="sm" variant="outline">Stats</Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default WouliEventCard;