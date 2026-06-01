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

// ============================================================================
// Helpers purs — Design système carte (Phase 1)
// ============================================================================

// Signaux textuels pour la détection d'énergie
const DJ_SIGNALS = ['dj', 'mix', 'b2b'];
const SCENE_SIGNALS = ['concert', 'live', 'spectacle', 'théâtre', 'theatre'];

/**
 * Détermine l'énergie visuelle d'un événement.
 * Priorité : champ serveur > signal DJ > signal SCÈNE > soirée tardive > défaut JOURNEE.
 */
function deriveEnergy(event: UnifiedEvent): 'SCENE' | 'CLUB' | 'JOURNEE' {
  if (event.energy) return event.energy;

  const haystack = `${event.title || ''} ${event.music_style || ''}`.toLowerCase();

  // RÈGLE DJ — priorité absolue
  if (DJ_SIGNALS.some((s) => haystack.includes(s))) return 'CLUB';

  // RÈGLE SCÈNE
  if (SCENE_SIGNALS.some((s) => haystack.includes(s))) return 'SCENE';

  // RÈGLE CLUB — soirée tardive
  const hour = parseInt(event.time?.split(':')[0] ?? '', 10);
  if (event.event_type === 'soirees' && !Number.isNaN(hour) && hour >= 22) return 'CLUB';

  // Défaut sûr
  return 'JOURNEE';
}

/**
 * Ajuste luminosité ET saturation d'une couleur hex via conversion HSL.
 * Les deux offsets (en points de %) s'appliquent ensemble sur un seul appel.
 * Si la couleur est très sombre (L < 30), l'offset de luminosité est réduit de
 * moitié pour éviter un fond quasi-noir sur les affiches sombres.
 */
function adjustColor(hex: string, lightnessOffset: number, saturationOffset: number): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return hex;

  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Application des offsets (luminosité réduite de moitié si couleur sombre)
  let lPct = l * 100;
  const lOff = lPct < 30 ? lightnessOffset / 2 : lightnessOffset;
  lPct = Math.max(0, Math.min(100, lPct + lOff));
  const l2 = lPct / 100;

  // Saturation : offset en points de %, appliqué conjointement
  let sPct = s * 100;
  sPct = Math.max(0, Math.min(100, sPct + saturationOffset));
  s = sPct / 100;

  // HSL → RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r2: number;
  let g2: number;
  let b2: number;
  if (s === 0) {
    r2 = g2 = b2 = l2;
  } else {
    const q = l2 < 0.5 ? l2 * (1 + s) : l2 + s - l2 * s;
    const p = 2 * l2 - q;
    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

/**
 * Extrait une couleur dominante depuis une image via canvas 10x10 (moyenne des pixels),
 * puis l'assombrit pour servir de fond de zone. Retourne null si CORS bloque getImageData.
 */
function extractCardColor(imgEl: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(imgEl, 0, 0, 10, 10);
    const { data } = ctx.getImageData(0, 0, 10, 10);

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    if (count === 0) return null;

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    const toHex = (x: number) => x.toString(16).padStart(2, '0');
    const avgHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    // Assombrissement + désaturation pour servir de fond de zone adaptative
    return adjustColor(avgHex, -25, -20);
  } catch {
    // CORS (images Instagram) → canvas tainted → échec attendu
    return null;
  }
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
  const [showImageModal, setShowImageModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPWA = useIsPWA();

  // --- Design système carte (Phase 1) ---
  const energy = deriveEnergy(event);
  // Fond de la zone infos. Défaut #1C1A1A (CLUB/SCENE), crème pour JOURNEE.
  const defaultBg = energy === 'JOURNEE' ? '#F4EDE0' : '#1C1A1A';
  // Priorité absolue au champ serveur color_card s'il est fourni.
  const [adaptiveBg, setAdaptiveBg] = useState<string>(event.color_card || defaultBg);

  // Extraction couleur depuis l'image chargée (fallback gracieux si CORS bloque).
  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    if (event.color_card) return; // le serveur prime, pas d'extraction
    const extracted = extractCardColor(e.currentTarget);
    if (extracted) setAdaptiveBg(extracted);
  };
  
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

  return (
    <div className="w-full h-full bg-background flex flex-col">

      {/* ════════════ ZONE PHOTO ════════════ */}
      {/* flex-1, min-height 55%, relative, overflow hidden — cliquable plein écran */}
      <div
        className="relative flex-1 overflow-hidden cursor-pointer"
        style={{ minHeight: '55%' }}
        onClick={() => setShowImageModal(true)}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
          alt={event.title}
          crossOrigin="anonymous"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            getFocusClass(event.image_focus_position),
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleImageLoaded}
          onError={handleImageError}
          loading="eager"
        />
      </div>

      {/* ════════════ ZONE INFOS ════════════ */}
      {/* flex-shrink-0, min-height 38%, fond adaptatif (#1C1A1A par défaut) */}
      {/* Structure uniquement — design appliqué en phase ultérieure */}
      <div
        ref={containerRef}
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{
          minHeight: '38%',
          background: adaptiveBg,
        }}
      >
        {/* Section infos fusionnée */}
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

        {/* Boutons d'action */}
        <div
          className="flex-shrink-0 px-4 py-3 bg-card border-t border-border mt-auto"
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
              onClick={handleDislike}
              className="flex-1 h-11 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
              aria-label="Passer"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>

            {/* Participer */}
            <ParticipateButton onClick={handleParticipate} />

            {/* Like */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex-1 h-11 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
              aria-label="J'aime"
            >
              <Heart className="w-5 h-5 text-pink-500" />
            </motion.button>

            {/* Partager */}
            <button
              onClick={handleShare}
              className="flex-1 h-11 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
              aria-label="Partager"
            >
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
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
                src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
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
