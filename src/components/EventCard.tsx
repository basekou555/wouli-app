import React, { useState, useEffect, useRef } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { X, Heart, Share2, Check } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { getSocialProofText, getPriceInfo, formatEventDateTime } from '@/utils/eventCardHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsPWA } from '@/hooks/useIsPWA';

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
        className="flex-[2] h-11 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
        aria-label="Participer"
      >
      {/* Animation success */}
      {isAnimating && (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-white rounded-xl"
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isPWA = useIsPWA();

  return (
    <div className="w-full h-full bg-background flex flex-col">

      {/* Contenu sans scroll - flexbox */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-col overflow-hidden min-h-0"
      >
        {/* Image - prend l'espace flexible restant */}
        <div className="relative flex-1 min-h-0">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
            alt={event.title}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            loading="eager"
          />
        </div>

        {/* Section infos fusionnée - Design Premium */}
        <div className="flex-shrink-0 px-4 py-3 bg-card border-b border-border">
          {/* Titre sur 2 lignes */}
          <h1 className="text-xl font-bold text-foreground line-clamp-2 leading-tight mb-1">
            {event.title}
          </h1>
          {/* Lieu */}
          <p className="text-sm text-muted-foreground mb-3">
            📍 {event.venue || event.location}
          </p>
          {/* Chips colorés premium */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              📅 {formatEventDateTime(event.date, event.time)}
            </span>
            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full">
              {getPriceInfo(event.price_text).display}
            </span>
            <span className="px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-full">
              👥 {event.totalParticipants || event.participants || 0}
            </span>
          </div>
        </div>

        {/* Social Proof - compact */}
        {(event.friendsParticipating && event.friendsParticipating.length > 0) && (
          <div className="flex-shrink-0 px-4 py-2 bg-card border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {event.friendsParticipating.slice(0, 3).map((friend) => (
                  friend.avatar ? (
                    <img
                      key={friend.id}
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-6 h-6 rounded-full border-2 border-card object-cover"
                    />
                  ) : (
                    <div
                      key={friend.id}
                      className="w-6 h-6 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-xs font-medium text-primary"
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                  )
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {getSocialProofText(event.friendsParticipating, event.totalParticipants || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Bouton voir plus - compact */}
        <div className="flex-shrink-0 px-4 py-2 bg-card border-b border-border">
          <button
            onClick={() => setIsDetailsOpen(true)}
            className="w-full py-2 bg-accent hover:bg-accent/80 rounded-lg text-sm font-medium transition-colors"
          >
            Voir plus de détails →
          </button>
        </div>
      </div>

      {/* Boutons d'action - Fixed bottom */}
      <div 
        className="flex-shrink-0 px-4 py-3 bg-card border-t border-border"
        style={{ 
          paddingBottom: isPWA 
            ? 'calc(0.75rem + env(safe-area-inset-bottom))' 
            : 'calc(1.5rem + env(safe-area-inset-bottom))'
        }}
      >
        <div className="flex gap-2 max-w-md mx-auto">
          {/* Dislike */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onDislike}
            className="flex-1 h-11 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
            aria-label="Passer"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </motion.button>

          {/* Participer */}
          <ParticipateButton onClick={onParticipate} />

          {/* Like */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onLike}
            className="flex-1 h-11 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
            aria-label="J'aime"
          >
            <Heart className="w-5 h-5 text-pink-500" />
          </motion.button>

          {/* Partager */}
          <button
            onClick={onShare}
            className="flex-1 h-11 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
            aria-label="Partager"
          >
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
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
    </div>
  );
};

export default EventCard;