import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TinderCard from 'react-tinder-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, Share2, Eye, Users, Euro } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { 
  getUrgencyBadge, 
  getSocialProofText, 
  formatEventDateTime, 
  getPriceInfo, 
  getLocationDisplay
} from '@/utils/eventCardHelpers';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';

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
  // États pour overlay indicators
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Vibration helper avec fallback gracieux
  const vibrate = (pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Handlers pour TinderCard
  const handleSwipe = (direction: string) => {
    console.log(`🔄 Swipe ${direction} détecté`);
    setSwipeDirection(null); // Reset overlay
    
    vibrate([10, 30, 10]);
    
    if (direction === 'right') {
      console.log('➡️ Swipe RIGHT - Like');
      onSwipeRight?.();
    } else if (direction === 'left') {
      console.log('⬅️ Swipe LEFT - Dislike');
      onSwipeLeft?.();
    }
  };

  const handleCardLeftScreen = () => {
    console.log('📤 Carte sortie de l\'écran');
    setSwipeDirection(null);
  };

  // Card content for swipe variant
  const SwipeCardContent = () => {
    const urgencyLabel = getUrgencyBadge(event.date, event.time);
    const priceInfo = getPriceInfo(event.price_text);
    const friends = event.friendsParticipating || [];
    const totalParticipants = event.totalParticipants || event.participants || 0;
    const locationText = getLocationDisplay(event.venue, event.location);
    const dateTimeText = formatEventDateTime(event.date, event.time);

    return (
      <>
        {/* Image section - ratio 4:5 */}
        <div className="relative aspect-[4/5] w-full">
          <img
            src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/500?random=event"}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          
          {/* Zone cliquable transparente pour la navigation */}
          <div 
            className="absolute inset-0 z-10"
            onClick={() => onCardClick?.()}
            onTouchEnd={(e) => {
              e.preventDefault();
              onCardClick?.();
            }}
            style={{ pointerEvents: 'auto' }}
          />
          
          {/* Urgency Badge */}
          {urgencyLabel && (
            <div className="absolute top-4 left-4">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {urgencyLabel}
              </span>
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
              {priceInfo.display}
            </span>
          </div>
          
          {/* Bouton partage - coin supérieur gauche si pas de badge urgence */}
          {onShare && !urgencyLabel && (
            <Button 
              size="sm"
              className="pressable absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full p-0 hover:bg-white border-0 z-20"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                onShare();
              }}
            >
              <Share2 className="h-4 w-4 text-gray-700" />
            </Button>
          )}
          
          {/* Swipe Overlays */}
          {swipeDirection === 'left' && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
              <div className="transform rotate-[-30deg] border-4 border-red-500 rounded-xl px-4 py-2">
                <span className="text-4xl font-bold text-red-500">NOPE</span>
              </div>
            </div>
          )}
          {swipeDirection === 'right' && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
              <div className="transform rotate-[30deg] border-4 border-green-500 rounded-xl px-4 py-2">
                <span className="text-4xl font-bold text-green-500">LIKE</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Event Info Section - Sous l'image, PAS en overlay */}
        <div className="p-4 flex-1 flex flex-col justify-between bg-white">
          {/* Zone cliquable transparente */}
          <div 
            className="absolute inset-0 z-10"
            onClick={() => onCardClick?.()}
            onTouchEnd={(e) => {
              e.preventDefault();
              onCardClick?.();
            }}
          />
          
          <div>
            {/* Title en gros */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
              {event.title}
            </h2>
            
            {/* Location, Time, Price sur une ligne */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
              <span className="flex items-center gap-1">
                📍 {locationText}
              </span>
              <span className="flex items-center gap-1">
                🕐 {dateTimeText}
              </span>
              <span className="flex items-center gap-1">
                💰 {priceInfo.display}
              </span>
            </div>
          </div>
          
          {/* Social Proof */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {/* Friends avatars placeholder */}
            {friends.length > 0 && (
              <div className="flex -space-x-1">
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
            <span>
              {friends.length > 0 
                ? `${friends.length} amis, ${totalParticipants} total`
                : totalParticipants > 0 
                  ? `${totalParticipants} personnes intéressées`
                  : "Sois le premier de tes amis"
              }
            </span>
          </div>
        </div>
      </>
    );
  };

  // VARIANTE SWIPE
  if (variant === 'swipe') {
    return enableSwipe ? (
      <div className="relative w-full h-full">
        <TinderCard
          onSwipe={(dir) => {
            if (dir === 'left') {
              setSwipeDirection('left');
              setTimeout(() => {
                onSwipeLeft?.();
                setSwipeDirection(null);
              }, 200);
            } else if (dir === 'right') {
              setSwipeDirection('right');
              setTimeout(() => {
                onSwipeRight?.();
                setSwipeDirection(null);
              }, 200);
            }
          }}
          onCardLeftScreen={() => setSwipeDirection(null)}
          preventSwipe={['up', 'down']}
          flickOnSwipe={true}
          swipeRequirementType="position"
          swipeThreshold={100}
          className="absolute w-full h-full"
        >
          <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
            <SwipeCardContent />
          </div>
        </TinderCard>
      </div>
    ) : (
      <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
        <SwipeCardContent />
      </div>
    );
  }

  // VARIANTE LIST
  if (variant === 'list') {
    const urgencyLabel = getUrgencyBadge(event.date, event.time);
    const priceInfo = getPriceInfo(event.price_text);
    const friends = event.friendsParticipating || [];
    const totalParticipants = event.totalParticipants || event.participants || 0;

    return (
      <Card className={`flex gap-3 p-3 rounded-lg hover:shadow-lg transition-all duration-300 bg-card cursor-pointer hover-scale ${className}`}>
        {/* Image avec ratio 4:5 */}
        <div className="relative flex-shrink-0" onClick={onCardClick}>
          <div className="w-20 aspect-[4/5] bg-black rounded-lg overflow-hidden">
            <img 
              src={event.image_url || "https://picsum.photos/400/500?random=event"}
              alt={event.title}
              className="w-full h-full object-contain" 
            />
          </div>
          
          
          {/* Badge urgence mini */}
          {urgencyLabel && (
            <Badge className="absolute top-1 right-1 bg-red-500 text-white border-none text-[10px] px-1 py-0.5 rounded scale-75 animate-pulse">
              {urgencyLabel}
            </Badge>
          )}
          
          {/* Bouton partage mini */}
          {onShare && (
            <Button 
              size="sm"
              className="absolute top-1 left-1 w-6 h-6 bg-white/90 backdrop-blur rounded-full p-0 hover:bg-white border-0"
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
            >
              <Share2 className="h-3 w-3 text-gray-700" />
            </Button>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div onClick={onCardClick}>
            {/* Ligne 1: Titre • Prix */}
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">
                {event.title}
              </h3>
              {!priceInfo.isFree && (
                <div className="flex items-center gap-1 text-purple-500 font-medium text-sm whitespace-nowrap">
                  <Euro className="w-3 h-3" />
                  <span>{priceInfo.display}</span>
                </div>
              )}
            </div>
            
            {/* Ligne 2: Date • Heure • Lieu */}
            <div className="text-xs text-muted-foreground mb-1">
              {formatEventDateTime(event.date, event.time)} • {getLocationDisplay(event.venue, event.location)}
            </div>
            
            {/* Ligne 3: Social proof avec avatars mini */}
            <div className="flex items-center space-x-2 mb-2">
              {/* Avatars amis mini (w-5 h-5) */}
              {friends.length > 0 && (
                <div className="flex -space-x-1">
                  {friends.slice(0, 3).map((friend) => (
                    <div 
                      key={friend.id} 
                      className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-medium text-white border border-white"
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
                {getSocialProofText(friends, totalParticipants)}
              </span>
            </div>
          </div>
          
          {/* Actions - 2 boutons seulement */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className={`flex-1 h-8 text-xs transition-all ${
                isParticipating 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
              onClick={onParticipate}
            >
              {isParticipating ? 'Inscrit' : 'Participer'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className={`w-8 h-8 p-0 transition-all border-2 ${
                isLiked 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'hover:bg-muted border-border'
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
              <div>{formatEventDateTime(event.date, event.time)} • {getLocationDisplay(event.venue, event.location)}</div>
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