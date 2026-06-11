import React, { useState, useEffect, useRef } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { X, Heart, Share2, Check } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { getSocialProofText, getPriceInfo, formatEventDateTime } from '@/utils/eventCardHelpers';
import { getFocusClass } from '@/utils/imageHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsPWA } from '@/hooks/useIsPWA';
import { useSmartTracking, type InteractionAction } from '@/hooks/useSmartTracking';

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
}

// Coordonnées Lyon par défaut
const getLyonCoordinates = () => ({ lat: 45.7640, lon: 4.8357 });

// Helper : URL image statique OpenStreetMap
const getStaticMapUrl = (lat: number, lon: number) => {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=600x300&markers=${lat},${lon},red-pushpin`;
};

// Métadonnées d'énergie (badge immersif en haut de carte)
const ENERGY_META: Record<string, { label: string; icon: string }> = {
  CLUB: { label: 'Club', icon: '🔥' },
  SCENE: { label: 'Scène', icon: '🎤' },
  JOURNEE: { label: 'Journée', icon: '☀️' },
};

// Style commun des chips "verre dépoli" posés sur l'image
const GLASS_CHIP =
  'flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/15 text-white text-xs font-semibold whitespace-nowrap';

// Composant ParticipateButton avec animation spéciale
const ParticipateButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();

    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
        aria-label="Participer"
      >
      {/* Animation success */}
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
  onMapClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const isPWA = useIsPWA();

  // Smart Tracking Integration
  const { startViewTracking, stopViewTracking, trackInteraction } = useSmartTracking();
  const hasTrackedView = useRef(false);

  // Start tracking when card becomes visible
  useEffect(() => {
    if (event?.id && !hasTrackedView.current) {
      startViewTracking(event.id);
      hasTrackedView.current = true;
    }

    return () => {
      if (event?.id && hasTrackedView.current) {
        stopViewTracking(event.id);
      }
    };
  }, [event?.id, startViewTracking, stopViewTracking]);

  // Wrapped handlers with tracking
  const handleDislike = () => {
    if (event?.id) {
      trackInteraction(event.id, 'dislike', event);
    }
    onDislike();
  };

  const handleLike = () => {
    if (event?.id) {
      trackInteraction(event.id, 'like', event);
    }
    onLike();
  };

  const handleParticipate = () => {
    if (event?.id) {
      trackInteraction(event.id, 'participate', event);
    }
    onParticipate();
  };

  const handleShare = () => {
    if (event?.id) {
      trackInteraction(event.id, 'share', event);
    }
    onShare?.();
  };

  // Champs enrichis par l'IA (présents selon la requête) — accès tolérant.
  const colorCard = (event as any).color_card as string | undefined;
  const subtitle = (event as any).subtitle as string | undefined;
  const energy = (event as any).energy as string | undefined;
  const energyMeta = energy ? ENERGY_META[energy] : undefined;

  const imageSrc = getProxiedImageUrl(event.image_url) || 'https://picsum.photos/400/600?random=event';
  const friends = event.friendsParticipating ?? [];
  const participantCount = event.totalParticipants || event.participants || 0;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Flyer plein cadre — cliquable pour le plein écran */}
      <div className="absolute inset-0" onClick={() => setShowImageModal(true)}>
        {!imageLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ backgroundColor: colorCard || '#18181b' }}
          />
        )}
        <img
          src={imageSrc}
          alt={event.title}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            getFocusClass(event.image_focus_position),
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          loading="eager"
        />
      </div>

      {/* Dégradé haut — lisibilité des contrôles */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />

      {/* Badge énergie — haut gauche */}
      {energyMeta && (
        <div className={cn(GLASS_CHIP, 'absolute top-4 left-4 z-10')}>
          <span>{energyMeta.icon}</span>
          <span>{energyMeta.label}</span>
        </div>
      )}

      {/* Bouton partage — haut droite */}
      <button
        onClick={handleShare}
        className="absolute top-3.5 right-4 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:bg-black/50 transition-colors"
        aria-label="Partager"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {/* Bloc bas : dégradé + infos + actions, posé sur l'image */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent" />

        <div
          className="relative px-4 pt-12 flex flex-col gap-3"
          style={{
            paddingBottom: isPWA
              ? 'calc(1rem + env(safe-area-inset-bottom))'
              : 'calc(1.25rem + env(safe-area-inset-bottom))',
          }}
        >
          {/* Social proof */}
          {friends.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {friends.slice(0, 3).map((friend) =>
                  friend.avatar ? (
                    <img
                      key={friend.id}
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-6 h-6 rounded-full border-2 border-white/60 object-cover"
                    />
                  ) : (
                    <div
                      key={friend.id}
                      className="w-6 h-6 rounded-full border-2 border-white/60 bg-white/20 flex items-center justify-center text-xs font-medium text-white"
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                  )
                )}
              </div>
              <span className="text-xs text-white/85">
                {getSocialProofText(friends, participantCount)}
              </span>
            </div>
          )}

          {/* Titre + sous-titre + lieu */}
          <div>
            <h1 className="text-2xl font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
              {event.title}
            </h1>
            {subtitle && (
              <p className="text-sm text-white/75 mt-0.5 line-clamp-1">{subtitle}</p>
            )}
            <p className="text-sm text-white/85 mt-1 drop-shadow">
              📍 {event.venue || event.location}
            </p>
          </div>

          {/* Chips verre dépoli */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={GLASS_CHIP}>
              📅 {formatEventDateTime(event.date, event.time)}
            </span>
            <span className={GLASS_CHIP}>{getPriceInfo(event.price_text).display}</span>
            <span className={GLASS_CHIP}>👥 {participantCount}</span>
          </div>

          {/* Voir plus de détails */}
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="self-start px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs font-medium active:bg-white/20 transition-colors"
          >
            Voir plus de détails →
          </button>

          {/* Boutons d'action flottants */}
          <div className="flex items-center gap-3 max-w-md mx-auto w-full pt-1">
            {/* Passer */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDislike}
              className="flex-1 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:bg-white/20 transition-colors"
              aria-label="Passer"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Participer */}
            <ParticipateButton onClick={handleParticipate} />

            {/* J'aime */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex-1 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:bg-white/20 transition-colors"
              aria-label="J'aime"
            >
              <Heart className="w-6 h-6 text-pink-400" />
            </motion.button>
          </div>
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
              <div className="sticky top-0 bg-background py-4 px-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Détails de l'événement</h2>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-2 hover:bg-accent rounded-full"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-6 pb-safe">
                {/* Description */}
                <div>
                  <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                    📝 Description
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description || "Aucune description disponible"}
                  </p>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold mb-2">🏷️ Tags</h3>
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
                  <h3 className="text-base font-semibold mb-2">🏢 Organisateur</h3>
                  <button
                    onClick={onEstablishmentClick}
                    className="w-full flex items-center gap-4 p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {event.venue_logo ? (
                        <img
                          src={event.venue_logo}
                          alt={event.venue || event.location}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🏢
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{event.venue || event.location}</p>
                      <p className="text-sm text-muted-foreground">Voir l'établissement →</p>
                    </div>
                  </button>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-base font-semibold mb-2">📍 Localisation</h3>
                  <button
                    onClick={onMapClick}
                    className="w-full h-[180px] rounded-lg overflow-hidden bg-muted relative group"
                  >
                    {event.address ? (
                      <img
                        src={getStaticMapUrl(getLyonCoordinates().lat, getLyonCoordinates().lon)}
                        alt={`Carte de ${event.location}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <span className="text-3xl mb-2">📍</span>
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
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      {event.address}
                    </p>
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
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImageModal(false)}
              className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            >
              <img
                src={imageSrc}
                alt={event.title}
                className="max-w-full max-h-full object-contain"
                onError={handleImageError}
              />
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventCard;
