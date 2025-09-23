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

export type EventCardVariant = 'swipe' | 'list' | 'business' | 'compact';

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

  // Card content for swipe variant - VERSION IMMERSIVE TINDER
  const SwipeCardContent = () => {
    const urgencyLabel = getUrgencyBadge(event.date, event.time);
    const priceInfo = getPriceInfo(event.price_text);
    const friends = event.friendsParticipating || [];
    const totalParticipants = event.totalParticipants || event.participants || 0;

    return (
      <div className="h-full w-full bg-gradient-to-b from-transparent to-black/60 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Image plein écran */}
        <div className="absolute inset-0">
          <img 
            src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          {/* Gradient overlay pour lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
        
        {/* Badges en haut */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          {/* Badge urgence */}
          {urgencyLabel && (
            <div className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
              {urgencyLabel}
            </div>
          )}
          
          {/* Badge prix */}
          <div className="bg-white/20 backdrop-blur-md text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
            {priceInfo.isFree ? '🎉 Gratuit' : `💰 ${priceInfo.display}`}
          </div>
        </div>
        
        {/* Contenu en bas de carte */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
          <h2 className="text-3xl font-bold mb-2 text-shadow">{event.title}</h2>
          
          <div className="flex items-center gap-4 text-sm mb-3">
            <span className="flex items-center gap-1">
              📍 {getLocationDisplay(event.venue, event.location)}
            </span>
            <span className="flex items-center gap-1">
              🕐 {formatEventDateTime(event.date, event.time)}
            </span>
          </div>
          
          {/* Social proof */}
          <div className="flex items-center gap-3 mb-4">
            {/* Avatars des amis */}
            {friends.length > 0 && (
              <div className="flex -space-x-2">
                {friends.slice(0, 3).map((friend) => (
                  <div 
                    key={friend.id} 
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-sm font-medium text-white border-2 border-white shadow-lg"
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
            <span className="text-sm opacity-90 font-medium">
              {friends.length > 0 
                ? `${friends[0].name} + ${friends.length - 1 + totalParticipants} autres y vont`
                : totalParticipants > 0 
                  ? `+${totalParticipants} personnes intéressées`
                  : "Sois le premier de tes amis !"
              }
            </span>
          </div>

          {/* FIX: restauration design carte swipe + immersion - Boutons d'action fixes */}
          <div className="flex justify-center gap-6 relative z-30">
            {/* Bouton Dislike/Cross */}
            <Button 
              size="lg"
              variant="outline"
              className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-red-500/80 hover:border-red-500 transition-all duration-300 min-h-[44px] min-w-[44px]"
              onClick={(e) => {
                e.stopPropagation();
                onDislike?.();
              }}
              aria-label="Ne pas aimer cet événement"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Bouton Participer */}
            <Button 
              size="lg"
              className={`px-8 h-14 rounded-full font-bold text-lg transition-all duration-300 min-h-[44px] shadow-lg ${
                isParticipating 
                  ? 'bg-green-500 hover:bg-green-600 text-white border-2 border-green-400' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-white/20'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onParticipate();
              }}
              aria-label={isParticipating ? "Vous participez déjà" : "Participer à cet événement"}
            >
              {isParticipating ? '✓ Inscrit' : 'Participer'}
            </Button>

            {/* Bouton Like/Heart */}
            <Button 
              size="lg"
              variant="outline"
              className={`w-14 h-14 rounded-full backdrop-blur-md border-white/20 transition-all duration-300 min-h-[44px] min-w-[44px] ${
                isLiked 
                  ? 'bg-red-500/80 border-red-500 text-white hover:bg-red-600/80' 
                  : 'bg-white/10 text-white hover:bg-pink-500/80 hover:border-pink-500'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
              aria-label={isLiked ? "Retirer de vos favoris" : "Ajouter à vos favoris"}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Overlays dynamiques (apparaissent pendant le swipe) */}
        {swipeDirection === 'left' && (
          <div className="absolute top-20 left-10 rotate-[-30deg] z-30">
            <div className="text-6xl font-bold text-red-500 border-4 border-red-500 px-4 py-2 rounded-xl bg-white/90 shadow-2xl">
              NOPE
            </div>
          </div>
        )}
        {swipeDirection === 'right' && (
          <div className="absolute top-20 right-10 rotate-[30deg] z-30">
            <div className="text-6xl font-bold text-green-500 border-4 border-green-500 px-4 py-2 rounded-xl bg-white/90 shadow-2xl">
              LIKE
            </div>
          </div>
        )}
        
        {/* Zone cliquable transparente pour la navigation - FIX: exclut les boutons */}
        <div 
          className="absolute inset-0 z-10"
          onClick={(e) => {
            // Ne pas déclencher si on clique sur un bouton ou un élément interactif
            if ((e.target as HTMLElement).closest('button')) {
              return;
            }
            onCardClick?.();
          }}
          style={{ pointerEvents: 'auto' }}
        />
      </div>
    );
  };

  // VARIANTE SWIPE - VERSION IMMERSIVE POUR EXPLORE
  if (variant === 'swipe') {
    return enableSwipe ? (
      <div className="relative">
        <TinderCard
          onSwipe={handleSwipe}
          onCardLeftScreen={handleCardLeftScreen}
          preventSwipe={['up', 'down']} // Bloquer swipes verticaux
          swipeRequirementType="position"
          swipeThreshold={Math.round(window.innerWidth * 0.4)}
          className="absolute w-full h-full"
        >
          <div className="w-full h-full">
            <SwipeCardContent />
          </div>
        </TinderCard>

        {/* OVERLAYS AVEC EMOJIS - Logique préservée */}
        <div
          style={{
            opacity: swipeDirection === 'right' ? 1 : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.1s ease-out'
          }}
          className="absolute top-6 left-6 text-4xl z-50"
        >
          ❤️
        </div>
        
        <div
          style={{
            opacity: swipeDirection === 'left' ? 1 : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.1s ease-out'
          }}
          className="absolute top-6 right-6 text-4xl z-50"
        >
          ❌
        </div>
      </div>
    ) : (
      <div className="w-full h-full">
        <SwipeCardContent />
      </div>
    );
  }

  // VARIANTE COMPACT - VERSION CARTE POUR USERAPP
  if (variant === 'compact') {
    const urgencyLabel = getUrgencyBadge(event.date, event.time);
    const priceInfo = getPriceInfo(event.price_text);
    const friends = event.friendsParticipating || [];
    const totalParticipants = event.totalParticipants || event.participants || 0;

    const CompactCardContent = () => (
      <Card className="h-full w-full rounded-2xl shadow-2xl overflow-hidden bg-card relative">
        {/* Image avec overlay gradient */}
        <div className="relative h-3/5">
          <img 
            src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges en haut */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {urgencyLabel && (
              <Badge className="bg-red-500 text-white text-xs font-bold animate-pulse">
                {urgencyLabel}
              </Badge>
            )}
            <Badge className="bg-white/20 backdrop-blur-md text-white text-xs font-bold">
              {priceInfo.isFree ? '🎉 Gratuit' : `💰 ${priceInfo.display}`}
            </Badge>
          </div>
        </div>
        
        {/* Contenu en bas */}
        <div className="h-2/5 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1 line-clamp-2">{event.title}</h3>
            <div className="text-sm text-muted-foreground mb-2">
              📍 {getLocationDisplay(event.venue, event.location)} • 🕐 {formatEventDateTime(event.date, event.time)}
            </div>
            
            {/* Social proof */}
            <div className="flex items-center gap-2 mb-3">
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
              <span className="text-xs text-muted-foreground">
                {getSocialProofText(friends, totalParticipants)}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 relative z-20">
            <Button 
              size="sm" 
              className={`flex-1 transition-all ${
                isParticipating 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onParticipate();
              }}
            >
              {isParticipating ? '✓ Inscrit' : 'Participer'}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className={`px-3 transition-all ${
                isLiked 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                  : 'hover:bg-muted'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Zone cliquable transparente - exclut les boutons */}
        <div 
          className="absolute inset-0 z-0"
          onClick={(e) => {
            // Ne pas déclencher si on clique sur un bouton
            if ((e.target as HTMLElement).closest('button')) {
              return;
            }
            onCardClick?.();
          }}
          style={{ pointerEvents: 'auto' }}
        />
        
        {/* Overlays pendant le swipe */}
        {swipeDirection === 'left' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] z-30">
            <div className="text-4xl font-bold text-red-500 border-4 border-red-500 px-3 py-1 rounded-xl bg-white/90 shadow-xl">
              NOPE
            </div>
          </div>
        )}
        {swipeDirection === 'right' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[15deg] z-30">
            <div className="text-4xl font-bold text-green-500 border-4 border-green-500 px-3 py-1 rounded-xl bg-white/90 shadow-xl">
              LIKE
            </div>
          </div>
        )}
      </Card>
    );

    return enableSwipe ? (
      <div className="relative w-full h-full">
        <TinderCard
          onSwipe={handleSwipe}
          onCardLeftScreen={handleCardLeftScreen}
          preventSwipe={['up', 'down']}
          swipeRequirementType="position"
          swipeThreshold={Math.round(window.innerWidth * 0.4)}
          className="absolute w-full h-full"
        >
          <CompactCardContent />
        </TinderCard>
      </div>
    ) : (
      <CompactCardContent />
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
          <div className="flex gap-2 relative z-20">
            <Button 
              size="sm" 
              className={`flex-1 h-8 text-xs transition-all ${
                isParticipating 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onParticipate();
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                onLike();
              }}
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