import React, { useState, useEffect, useRef } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { X, Heart, Share2, Check, Undo2, MapPin, Calendar, Users, ChevronDown } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { getSocialProofText, getPriceInfo, formatEventDateTime } from '@/utils/eventCardHelpers';
import { getFocusClass } from '@/utils/imageHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsPWA } from '@/hooks/useIsPWA';
import { useSmartTracking } from '@/hooks/useSmartTracking';

interface EventCardProps {
  event: UnifiedEvent;
  isFirstEvent: boolean;
  onBack: () => void;
  onDislike: () => void;
  onLike: () => void;
  onParticipate: () => void;
  onShare?: () => void;
  onEstablishmentClick?: () => void;
  onMapClick?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

const getLyonCoordinates = () => ({ lat: 45.7640, lon: 4.8357 });

const getStaticMapUrl = (lat: number, lon: number) => {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=600x300&markers=${lat},${lon},red-pushpin`;
};

const ParticipateButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={handleClick}
      className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg hover:shadow-xl hover:opacity-95 flex items-center justify-center gap-2 relative overflow-hidden"
      aria-label="Participer"
    >
      {isAnimating && (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-white rounded-2xl"
          />
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos(i * Math.PI / 2) * 40,
                y: Math.sin(i * Math.PI / 2) * 40,
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{ top: '50%', left: '50%' }}
            />
          ))}
        </>
      )}
      <motion.div
        animate={isAnimating ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <Check className="w-5 h-5" />
        <span>Participer</span>
      </motion.div>
    </motion.button>
  );
};

const EventCard: React.FC<EventCardProps> = ({
  event,
  onDislike,
  onLike,
  onParticipate,
  onShare,
  onEstablishmentClick,
  onMapClick,
  onUndo,
  canUndo,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const isPWA = useIsPWA();

  const { startViewTracking, stopViewTracking, trackInteraction } = useSmartTracking();
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (event?.id && !hasTrackedView.current) {
      startViewTracking(event.id);
      hasTrackedView.current = true;
    }
    return () => {
      if (event?.id && hasTrackedView.current) stopViewTracking(event.id);
    };
  }, [event?.id, startViewTracking, stopViewTracking]);

  const handleDislike = () => {
    if (event?.id) trackInteraction(event.id, 'dislike', event);
    onDislike();
  };

  const handleLike = () => {
    if (event?.id) trackInteraction(event.id, 'like', event);
    onLike();
  };

  const handleParticipate = () => {
    if (event?.id) trackInteraction(event.id, 'participate', event);
    onParticipate();
  };

  const handleShare = () => {
    if (event?.id) trackInteraction(event.id, 'share', event);
    onShare?.();
  };

  const priceInfo = getPriceInfo(event.price_text);

  return (
    <div className="w-full h-full flex flex-col">

      {/* Image plein écran + overlay infos */}
      <div
        className="relative flex-1 min-h-0 cursor-pointer overflow-hidden"
        onClick={() => setShowImageModal(true)}
      >
        {/* Skeleton loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        )}

        {/* Photo */}
        <img
          src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
          alt={event.title}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            getFocusClass(event.image_focus_position),
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          loading="eager"
        />

        {/* Gradient sombre en bas */}
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

        {/* Overlay infos */}
        <div
          className="absolute inset-x-0 bottom-0 p-4 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Social proof */}
          {event.friendsParticipating && event.friendsParticipating.length > 0 && (
            <div className="flex items-center gap-2 mb-2 pointer-events-auto">
              <div className="flex -space-x-1.5">
                {event.friendsParticipating.slice(0, 3).map((friend) => (
                  friend.avatar ? (
                    <img
                      key={friend.id}
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-5 h-5 rounded-full border border-white/40 object-cover"
                    />
                  ) : (
                    <div
                      key={friend.id}
                      className="w-5 h-5 rounded-full border border-white/40 bg-primary/60 flex items-center justify-center text-[9px] font-bold text-white"
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                  )
                ))}
              </div>
              <span className="text-white/80 text-xs">
                {getSocialProofText(event.friendsParticipating, event.totalParticipants || 0)}
              </span>
            </div>
          )}

          {/* Titre */}
          <h1 className="text-white text-[1.35rem] font-black leading-tight line-clamp-2 mb-1.5 drop-shadow-lg">
            {event.title}
          </h1>

          {/* Lieu */}
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
            <span className="text-white/80 text-sm font-medium truncate">
              {event.venue || event.location}
            </span>
          </div>

          {/* Chips */}
          <div className="flex items-center gap-2 flex-wrap mb-3 pointer-events-auto">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/20">
              <Calendar className="w-3 h-3" />
              {formatEventDateTime(event.date, event.time)}
            </span>
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
              priceInfo.isFree
                ? "bg-emerald-500/80 text-white"
                : "bg-white/15 text-white border border-white/20"
            )}>
              {priceInfo.display}
            </span>
            {(event.totalParticipants || event.participants || 0) > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/20">
                <Users className="w-3 h-3" />
                {event.totalParticipants || event.participants}
              </span>
            )}
          </div>

          {/* Voir les détails */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsDetailsOpen(true); }}
            className="flex items-center gap-1 text-white/60 text-xs font-medium hover:text-white/90 transition-colors pointer-events-auto"
          >
            Voir les détails
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Barre d'actions */}
      <div
        className="flex-shrink-0 px-4 pt-3 bg-card border-t border-border/50"
        style={{
          paddingBottom: isPWA
            ? 'calc(0.75rem + env(safe-area-inset-bottom))'
            : 'calc(1rem + env(safe-area-inset-bottom))'
        }}
      >
        <div className="flex gap-2 max-w-md mx-auto">
          {/* Retour */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1 h-12 rounded-2xl bg-amber-50 hover:bg-amber-100 transition-colors flex items-center justify-center border border-amber-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Retour"
          >
            <Undo2 className="w-4.5 h-4.5 text-amber-500" />
          </motion.button>

          {/* Dislike */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleDislike}
            className="flex-1 h-12 rounded-2xl bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center border border-red-100"
            aria-label="Passer"
          >
            <X className="w-5 h-5 text-red-400" />
          </motion.button>

          {/* Participer */}
          <ParticipateButton onClick={handleParticipate} />

          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleLike}
            className="flex-1 h-12 rounded-2xl bg-pink-50 hover:bg-pink-100 transition-colors flex items-center justify-center border border-pink-100"
            aria-label="J'aime"
          >
            <Heart className="w-5 h-5 text-pink-500" />
          </motion.button>

          {/* Partager */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleShare}
            className="flex-1 h-12 rounded-2xl bg-muted hover:bg-muted/70 transition-colors flex items-center justify-center border border-border"
            aria-label="Partager"
          >
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Drawer détails */}
      <AnimatePresence>
        {isDetailsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-background py-4 px-4 border-b border-border/50 flex justify-between items-center">
                <h2 className="text-base font-bold">{event.title}</h2>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-5 pb-safe">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5 uppercase tracking-wider text-muted-foreground">Description</h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {event.description || "Aucune description disponible"}
                  </p>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Établissement */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Organisateur</h3>
                  <button
                    onClick={onEstablishmentClick}
                    className="w-full flex items-center gap-3 p-3.5 bg-muted/50 rounded-2xl hover:bg-muted transition-colors border border-border/50"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {event.venue_logo ? (
                        <img src={event.venue_logo} alt={event.venue || event.location} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-primary/10">🏢</div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{event.venue || event.location}</p>
                      <p className="text-xs text-muted-foreground">Voir l'établissement →</p>
                    </div>
                  </button>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Localisation</h3>
                  <button
                    onClick={onMapClick}
                    className="w-full h-[160px] rounded-2xl overflow-hidden bg-muted relative group border border-border/50"
                  >
                    {event.address ? (
                      <img
                        src={getStaticMapUrl(getLyonCoordinates().lat, getLyonCoordinates().lon)}
                        alt={`Carte de ${event.location}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <MapPin className="w-6 h-6" />
                        <span className="text-sm">Adresse non disponible</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-full">
                        Ouvrir dans Maps
                      </span>
                    </div>
                  </button>
                  {event.address && (
                    <p className="mt-2 text-xs text-muted-foreground text-center">{event.address}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Fullscreen Image */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <img
              src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
              alt={event.title}
              className="max-w-full max-h-full object-contain"
              onError={handleImageError}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventCard;
