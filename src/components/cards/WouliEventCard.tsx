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
    
    console.log('🔄 Drag ended:', { offset, velocity });
    
    // Lower thresholds for better mobile experience
    if (offset > 50 || velocity > 300) {
      console.log('➡️ Swipe right detected');
      onSwipeRight?.();
    } else if (offset < -50 || velocity < -300) {
      console.log('⬅️ Swipe left detected');
      onSwipeLeft?.();
    }
  };

  // Helper function for urgency badge
  const getUrgencyBadge = () => {
    const now = new Date();
    const eventDateTime = new Date(`${event.date}${event.time ? `T${event.time}` : ''}`);
    const hoursUntil = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntil < 2) return "Maintenant";
    if (hoursUntil < 4) return "Dans 2h";
    
    // Check if it's the same day
    const isSameDay = now.toDateString() === eventDateTime.toDateString();
    if (isSameDay) return "Ce soir";
    
    return null;
  };

  // Card content for swipe variant
  const SwipeCardContent = () => {
    const urgencyLabel = getUrgencyBadge();
    const priceText = getPriceText();
    const showPrice = priceText !== 'Gratuit';
    const friends = event.friendsParticipating || [];
    const totalParticipants = event.totalParticipants || event.participants || 0;

    return (
      <>
        {/* Zone Image (70%) */}
        <div className="relative aspect-[4/5] cursor-pointer" onClick={onCardClick}>
          <img 
            src={event.image_url || "https://picsum.photos/400/500?random=event"}
            alt={event.title}
            className="w-full h-full object-cover" 
          />
          
          {/* Badge urgence - coin supérieur droit */}
          {urgencyLabel && (
            <Badge className="absolute top-3 right-3 bg-red-500 text-white border-none animate-pulse hover:animate-none text-xs font-medium px-2 py-1 rounded-lg shadow-lg">
              {urgencyLabel}
            </Badge>
          )}
          
          {/* Bouton partage - coin supérieur gauche */}
          {onShare && (
            <Button 
              size="sm"
              className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full p-0 hover:bg-white border-0"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
            >
              <Share2 className="h-4 w-4 text-gray-700" />
            </Button>
          )}
        </div>
        
        {/* Zone Informations (20%) */}
        <div className="p-4 space-y-2">
          {/* Ligne 1: Titre • Prix */}
          <div className="flex justify-between items-start gap-2" onClick={onCardClick}>
            <h3 className="font-bold text-lg text-foreground truncate flex-1 cursor-pointer">
              {event.title}
            </h3>
            {showPrice && (
              <span className="text-purple-500 font-semibold whitespace-nowrap">
                • {priceText}
              </span>
            )}
          </div>
          
          {/* Ligne 2: Heure • Lieu */}
          <div className="text-sm text-muted-foreground cursor-pointer" onClick={onCardClick}>
            {formatDateTime()} • {getLocationText()}
          </div>
          
          {/* Ligne 3: Social proof */}
          <div onClick={onCardClick} className="cursor-pointer">
            <div className="flex items-center space-x-2">
              {/* Avatars amis (3 max, 24px, overlap -space-x-2) */}
              {friends.length > 0 && (
                <div className="flex -space-x-2">
                  {friends.slice(0, 3).map((friend) => (
                    <div 
                      key={friend.id} 
                      className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium text-white border-2 border-white"
                    >
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        friend.name.charAt(0).toUpperCase()
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Texte social proof */}
              <span className="text-xs text-muted-foreground">
                {friends.length > 0 
                  ? `${friends.length} amis, ${totalParticipants} total`
                  : totalParticipants > 0 
                    ? `${totalParticipants} personnes intéressées`
                    : "Sois le premier"
                }
              </span>
            </div>
          </div>
        </div>
        
        {/* Zone Actions (10%) */}
        <div className="px-4 pb-4">
          <div className="flex gap-3">
            {/* Bouton × */}
            {onDislike && (
              <Button 
                variant="outline" 
                size="sm"
                className="h-11 flex-1 bg-gray-100 hover:bg-gray-200 border-gray-200"
                onClick={onDislike}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            {/* Bouton Participer */}
            <Button 
              className={`h-11 font-semibold ${
                onDislike ? 'flex-[2]' : 'flex-1'
              } ${
                isParticipating 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
              onClick={onParticipate}
            >
              {isParticipating ? '✅ Inscrit' : 'Participer'}
            </Button>
            
            {/* Bouton ♡ */}
            <Button 
              variant="outline" 
              size="sm"
              className={`h-11 flex-1 border-2 ${
                isLiked 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'bg-background hover:bg-muted border-border'
              }`}
              onClick={onLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </>
    );
  };

  // VARIANTE SWIPE
  if (variant === 'swipe') {
    return enableSwipe ? (
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02, rotate: 5 }}
        whileTap={{ scale: 0.98 }}
        className="cursor-grab active:cursor-grabbing touch-none"
        style={{ touchAction: 'none' }}
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