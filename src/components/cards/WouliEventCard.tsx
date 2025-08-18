import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
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
  // États pour animations addictives
  const [isDragging, setIsDragging] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showDislikeAnimation, setShowDislikeAnimation] = useState(false);

  // Motion values pour animations ultra-fluides
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Animation values optimisées pour performance
  const scale = useTransform(x, [-200, 0, 200], [1.05, 1.02, 1.05]);
  const y = useTransform(x, [-200, 0, 200], [10, 0, 10], { clamp: false });
  const brightness = useTransform(x, [-200, -60, 0, 60, 200], [0.8, 0.9, 1.05, 1.15, 1.2]);
  
  // Vibration helper avec fallback gracieux
  const vibrate = (pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (!enableSwipe) return;
    
    setIsDragging(false);
    
    const offset = info.offset.x;
    const velocity = Math.abs(info.velocity.x);
    const distance = Math.abs(offset);
    
    console.log('🔄 Drag ended:', { offset, velocity });
    
    // ÉVALUATION INTELLIGENTE inspirée react-tinder-card
    const swipeRequirementType = 'velocity'; // ou 'position'
    
    let shouldSwipe = false;
    if (swipeRequirementType === 'velocity') {
      shouldSwipe = velocity > 300;  // Basé sur vitesse
    } else {
      shouldSwipe = distance > window.innerWidth * 0.25; // 25% de l'écran
    }
    
    if (shouldSwipe) {
      // SWIPE VALIDÉ = RÉCOMPENSE MAXIMALE
      
      // Vibration de satisfaction
      vibrate([15, 50, 15]);
      
      if (offset > 0) {
        // LIKE ANIMATION
        setShowLikeAnimation(true);
        setTimeout(() => setShowLikeAnimation(false), 250);
        console.log('➡️ Swipe RIGHT validé - Like');
        onSwipeRight?.();
      } else {
        // DISLIKE ANIMATION  
        setShowDislikeAnimation(true);
        setTimeout(() => setShowDislikeAnimation(false), 250);
        console.log('⬅️ Swipe LEFT validé - Dislike');
        onSwipeLeft?.();
      }
    } else {
      console.log('🔄 Swipe annulé - retour au centre');
      // Spring bouncy pour encourager à re-essayer
    }
  };

  // Card content for swipe variant
  const SwipeCardContent = () => {
    const urgencyLabel = getUrgencyBadge(event.date, event.time);
    const priceInfo = getPriceInfo(event.price_text);
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
            {!priceInfo.isFree && (
              <div className="flex items-center gap-1 text-purple-500 font-semibold whitespace-nowrap">
                <Euro className="w-4 h-4" />
                <span>{priceInfo.display}</span>
              </div>
            )}
          </div>
          
          {/* Ligne 2: Heure • Lieu */}
          <div className="text-sm text-muted-foreground cursor-pointer" onClick={onCardClick}>
            {formatEventDateTime(event.date, event.time)} • {getLocationDisplay(event.venue, event.location)}
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
      <div className="relative">
        <motion.div
          drag="x"
          dragConstraints={{ left: -200, right: 200 }}
          dragElastic={0.1}                           // Moins d'élasticité = plus de contrôle
          dragMomentum={false}                        // Pas de momentum libre
          dragTransition={{ 
            power: 0.2,                               // Mouvement plus naturel
            timeConstant: 150                         // Plus réactif
          }}
          
          // OPTIMISATION PERFORMANCE
          transformTemplate={({ x, rotate, scale }) => 
            `translate3d(${x}px, 0, 0) rotate(${rotate}deg) scale(${scale})`
          }
          
          // FEEDBACK INSTANTANÉ
          onDragStart={() => {
            setIsDragging(true);
            vibrate(8);
          }}
          
          onDragEnd={handleDragEnd}
          style={{ 
            x, 
            rotate,
            scale,
            y: y
          }}
          
          // ANIMATION ADDICTIVE PENDANT DRAG
          whileDrag={{ 
            zIndex: 50,
            filter: "brightness(1.1)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }}
          
          // POSITION DE REPOS PARFAITE
          animate={{ 
            x: 0, 
            y: 0, 
            rotate: 0,
            scale: 1,
            filter: 'brightness(1)'
          }}
          
          // SPRING ULTRA OPTIMISÉ
          transition={{
            type: "spring",
            stiffness: 500,      // Plus réactif
            damping: 35,         // Moins d'oscillation
            mass: 0.7           // Plus léger = plus fluide
          }}
          className="cursor-grab active:cursor-grabbing"
        >
          <Card className={`max-w-[343px] rounded-xl shadow-xl overflow-hidden bg-card ${className}`}>
            <SwipeCardContent />
          </Card>
        </motion.div>

        {/* OVERLAY LIKE ANIMATION */}
        {showLikeAnimation && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-2 rounded-lg bg-green-500/90 text-white text-3xl font-bold rotate-12 shadow-lg">
              ❤️
            </div>
          </motion.div>
        )}

        {/* OVERLAY DISLIKE ANIMATION */}
        {showDislikeAnimation && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 2 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-2 rounded-lg bg-red-500/90 text-white text-3xl font-bold -rotate-12 shadow-lg">
              ❌
            </div>
          </motion.div>
        )}
      </div>
    ) : (
      <Card className={`max-w-[343px] rounded-xl shadow-xl overflow-hidden bg-card ${className}`}>
        <SwipeCardContent />
      </Card>
    );
  }

  // VARIANTE LIST
  if (variant === 'list') {
    const urgencyLabel = getUrgencyBadge(event.date, event.time);
    const priceInfo = getPriceInfo(event.price_text);
    const friends = event.friendsParticipating || [];
    const totalParticipants = event.totalParticipants || event.participants || 0;

    return (
      <Card className={`flex gap-3 p-3 h-24 rounded-lg hover:shadow-lg transition-all duration-300 bg-card cursor-pointer hover-scale ${className}`}>
        {/* Image carrée */}
        <div className="relative flex-shrink-0" onClick={onCardClick}>
          <img 
            src={event.image_url || "https://picsum.photos/400/400?random=event"}
            alt={event.title}
            className="w-24 h-24 rounded-lg object-cover" 
          />
          
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
              <h3 className="font-semibold text-sm text-foreground truncate flex-1">
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