import React, { useState, useEffect, useRef } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { X, Share2, Check, Bookmark, Info } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { getSocialProofText, getPriceInfo } from '@/utils/eventCardHelpers';
import { getFocusClass } from '@/utils/imageHelpers';
import { normalizeAmbiance } from '@/utils/ambiance';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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
// Salles de concert / scènes lyonnaises connues → énergie SCÈNE garantie.
const SCENE_VENUES = ['transbordeur', 'radiant', 'ninkasi', 'théâtre', 'theatre', 'salle'];

/**
 * Détermine l'énergie visuelle d'un événement.
 * Priorité : champ serveur > signal DJ > signaux SCÈNE (texte/tags/salle) > soirée
 * (tardive = CLUB, plus tôt = SCÈNE concert) > défaut JOURNEE.
 */
function deriveEnergy(event: UnifiedEvent): 'SCENE' | 'CLUB' | 'JOURNEE' {
  if (event.energy) return event.energy;

  // Le haystack inclut désormais les tags (souvent 'concert', 'live'...) en plus du titre.
  const tags = (event.tags || []).join(' ');
  const haystack = `${event.title || ''} ${event.music_style || ''} ${tags}`.toLowerCase();
  const venue = `${event.venue || ''} ${event.location || ''}`.toLowerCase();
  const hour = parseInt(event.time?.split(':')[0] ?? '', 10);

  const energy: 'SCENE' | 'CLUB' | 'JOURNEE' = (() => {
    // RÈGLE DJ — priorité absolue
    if (DJ_SIGNALS.some((s) => haystack.includes(s))) return 'CLUB';

    // RÈGLE SCÈNE — signaux texte / tags
    if (SCENE_SIGNALS.some((s) => haystack.includes(s))) return 'SCENE';

    // RÈGLE SCÈNE — salle de concert connue
    if (SCENE_VENUES.some((v) => venue.includes(v))) return 'SCENE';

    // RÈGLE SOIRÉE — tardive (>= 22h) = CLUB, plus tôt = SCÈNE (concert/live en salle)
    if (event.event_type === 'soirees' && !Number.isNaN(hour)) {
      return hour >= 22 ? 'CLUB' : 'SCENE';
    }

    // Défaut sûr
    return 'JOURNEE';
  })();

  // Debug : trace l'énergie dérivée et les signaux utilisés (à retirer une fois calibré).
  console.log(`[deriveEnergy] "${event.title}" → ${energy}`, {
    event_type: event.event_type,
    hour: Number.isNaN(hour) ? null : hour,
    tags: event.tags,
    venue,
  });

  return energy;
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

// Conversion hex → rgba(...)
function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  if (m.length !== 6) return hex;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Luminosité 0-100 d'une couleur hex (composante L de HSL)
function colorLuminance(hex: string): number {
  const m = hex.replace('#', '');
  if (m.length !== 6) return 50;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100;
}

// Nom de lieu propre (sans la partie après une virgule : "Ninkasi, Gerland" → "Ninkasi").
function getVenueName(event: UnifiedEvent): string {
  const raw = event.venue || event.location || '';
  return raw.split(',')[0].replace(/\s+/g, ' ').trim();
}

// Titre nettoyé (espaces normalisés). Si le titre ressemble à une caption Instagram
// (présence de " – " ou " : " ET plus de 5 mots), on retombe sur le nom du lieu.
function cleanTitle(event: UnifiedEvent): string {
  const cleaned = (event.title || '').replace(/\s+/g, ' ').trim();
  const looksLikeCaption =
    /\s[–—:]\s/.test(cleaned) && cleaned.split(' ').length > 5;
  if (looksLikeCaption) {
    const venueName = getVenueName(event);
    if (venueName) return venueName;
  }
  return cleaned;
}

// Libellé d'activité FR depuis la catégorie
function categoryLabel(event: UnifiedEvent): string {
  const c = event.event_type || event.category;
  switch (c) {
    case 'a-boire':
      return 'À BOIRE';
    case 'a-manger':
      return 'À MANGER';
    case 'soirees':
      return 'SOIRÉE';
    case 'activites':
      return 'ACTIVITÉ';
    default:
      return 'ÉVÉNEMENT';
  }
}

// Heure "22h00" / "22h"
function formatHeure(time?: string): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hh = parseInt(h, 10);
  if (Number.isNaN(hh)) return time;
  return m && m !== '00' ? `${hh}h${m}` : `${hh}h`;
}

// Date courte "sam 17"
function formatDateShort(date: string): string {
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return '';
  return dt
    .toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })
    .replace(/\./g, '');
}

// Taille de titre (px) selon énergie, longueur, et récurrence (une taille en dessous)
function titleFontSize(
  energy: 'SCENE' | 'CLUB' | 'JOURNEE',
  title: string,
  recurring: boolean,
): number {
  const n = title.length;
  let size: number;
  if (energy === 'JOURNEE') {
    size = n <= 16 ? 15 : 13;
    if (recurring) size = size === 15 ? 13 : 11;
  } else if (energy === 'SCENE') {
    size = n <= 10 ? 22 : n <= 16 ? 19 : 17;
    if (recurring) size = size === 22 ? 19 : size === 19 ? 17 : 14;
  } else {
    // CLUB
    size = n <= 10 ? 20 : n <= 16 ? 17 : 14;
    if (recurring) size = size === 20 ? 17 : size === 17 ? 14 : 12;
  }
  return size;
}

// Numéro d'édition pour un événement récurrent (null sinon)
function getEditionNumber(event: UnifiedEvent): number | null {
  if (!event.is_recurring) return null;
  return event.edition_number ?? null;
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

  // --- Design système carte (Phase 2 : 3 énergies) ---
  const POPPINS = "'Poppins', sans-serif";
  const isJournee = energy === 'JOURNEE';
  const title = cleanTitle(event);
  const venue = event.venue || event.location || '';
  const recurring = !!event.is_recurring;
  const price = getPriceInfo(event.price_text);
  const heure = formatHeure(event.time);
  const dateShort = formatDateShort(event.date);
  const titleSize = titleFontSize(energy, title, recurring);
  const ambiance = normalizeAmbiance(event.music_style, event.tags, categoryLabel(event));

  // États superposables
  const isUnique = !!event.is_unique;
  const editionNumber = getEditionNumber(event);

  // Couleurs dérivées de la couleur adaptative (CLUB / SCÈNE : tirées de la photo)
  const accentFull = adjustColor(adaptiveBg, 45, 10); // pleine luminosité (néon, bordure)
  const accentBright = adjustColor(adaptiveBg, 30, 0); // +30% lum (texte de tag)

  // JOURNÉE : identité de jour portée par le TYPE d'événement, pas par la photo.
  // Fond papier crème fixe + accent sémantique selon le sous-type (≠ couleur dominante).
  const JOURNEE_ACCENTS: Record<string, string> = {
    'a-manger': '#C9683B', // terracotta
    'a-boire': '#D99A2B',  // ambre
    'activites': '#7E8C5A', // sauge
  };
  const journeeAccent = JOURNEE_ACCENTS[(event.event_type || event.category) as string] ?? '#B5853F';
  const journeeAccentInk = adjustColor(journeeAccent, -8, 0); // assombri pour texte lisible sur crème
  const journeeBg = '#F4EDE0';

  // Encre selon énergie : blanc sur CLUB/SCENE, encre sombre sur JOURNEE
  const ink = isJournee ? '#1A1208' : '#FFFFFF';
  const inkMuted = isJournee ? 'rgba(26,18,8,0.55)' : 'rgba(255,255,255,0.62)';

  // Fond SCENE : garanti assez sombre pour du texte blanc lisible, quelle que soit
  // la couleur extraite de l'image (sinon titre blanc sur fond clair = illisible).
  const ensureDark = (hex: string) => {
    const L = colorLuminance(hex);
    return L > 30 ? adjustColor(hex, 30 - L, 0) : hex;
  };
  const sceneBg = ensureDark(adaptiveBg);

  // Néon renforcé pour l'état UNIQUE (CLUB/SCENE)
  const neonTop = isUnique ? adjustColor(accentFull, 20, 0) : accentFull;
  const neonShadow = isUnique
    ? `0 -3px 28px ${hexToRgba(accentFull, 0.75)}, 0 0 0 1px ${hexToRgba(accentFull, 0.2)}`
    : `0 -2px 20px ${hexToRgba(accentFull, 0.6)}, inset 0 -1px 8px ${hexToRgba(accentFull, 0.3)}`;

  // Style de la zone infos selon énergie
  const zoneStyle: React.CSSProperties =
    energy === 'CLUB'
      ? {
          background: `linear-gradient(160deg, ${hexToRgba(adaptiveBg, 0.6)} 0%, rgba(8,8,8,0.98) 92%)`,
          borderTop: `2px solid ${neonTop}`,
          boxShadow: neonShadow,
        }
      : energy === 'SCENE'
      ? {
          background: sceneBg,
          ...(isUnique ? { borderTop: `2px solid ${neonTop}`, boxShadow: neonShadow } : {}),
        }
      : {
          background: journeeBg,
          // JOURNEE unique : trait gauche plus épais + glow (accent sémantique du sous-type)
          borderLeft: `${isUnique ? 4 : 3}px solid ${journeeAccent}`,
          ...(isUnique ? { boxShadow: `-2px 0 12px ${hexToRgba(journeeAccent, 0.35)}` } : {}),
        };

  // Bordure de carte pour JOURNEE unique (sur le wrapper)
  const wrapperStyle: React.CSSProperties =
    isUnique && isJournee
      ? { boxShadow: `0 0 0 1.5px ${hexToRgba(journeeAccent, 0.45)}` }
      : {};

  // Style du badge UNIQUE selon énergie
  const uniqueBadgeStyle: React.CSSProperties = isJournee
    ? { color: '#1A1208', background: 'rgba(26,18,8,0.08)', border: '0.5px solid rgba(26,18,8,0.3)' }
    : { color: accentBright, background: hexToRgba(accentFull, 0.15), border: `1px solid ${hexToRgba(accentFull, 0.6)}` };

  // Barre d'action : fond + libellé CTA selon énergie/prix
  const actionBarBg = isJournee ? 'rgba(26,18,8,0.06)' : 'rgba(0,0,0,0.20)';
  const priceColor = price.isFree
    ? isJournee
      ? journeeAccentInk
      : adjustColor(adaptiveBg, 20, 0)
    : ink;
  const ctaLabel = price.isFree ? "C'est gratuit ce soir →" : "J'y vais →";
  
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
    <div className="w-full h-full bg-black flex flex-col" style={wrapperStyle}>

      {/* ════════════ ZONE PHOTO ════════════ */}
      {/* flex-1 : reprend tout l'espace restant (proportions d'origine) */}
      <div
        className="relative flex-1 min-h-0 overflow-hidden cursor-pointer"
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

        {/* SCENE : fondu du bas de la photo vers la couleur extraite */}
        {energy === 'SCENE' && (
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '72px',
              background: `linear-gradient(to bottom, transparent, ${sceneBg})`,
            }}
          />
        )}

        {/* Détails + badge UNIQUE (haut gauche) */}
        <div className="absolute left-3 z-10 flex items-center gap-2" style={{ top: 'calc(var(--app-header-h, 0px) + 12px)' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsOpen(true);
            }}
            className="w-8 h-8 rounded-full bg-black/35 backdrop-blur flex items-center justify-center"
            aria-label="Voir les détails"
          >
            <Info className="w-4 h-4 text-white" />
          </button>
          {isUnique && (
            <span
              style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: '4px', padding: '3px 7px', fontFamily: POPPINS, ...uniqueBadgeStyle }}
            >
              Unique
            </span>
          )}
        </div>

        {/* Partager + Passer (haut droite) */}
        <div className="absolute right-3 z-10 flex gap-2" style={{ top: 'calc(var(--app-header-h, 0px) + 12px)' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="w-8 h-8 rounded-full bg-black/35 backdrop-blur flex items-center justify-center"
            aria-label="Partager"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDislike();
            }}
            className="w-8 h-8 rounded-full bg-black/35 backdrop-blur flex items-center justify-center"
            aria-label="Passer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* État RÉCURRENT : badge numéro d'édition (bas gauche) */}
        {editionNumber !== null && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              zIndex: 5,
              background: 'rgba(0,0,0,0.40)',
              backdropFilter: 'blur(4px)',
              borderRadius: '2px',
              padding: '3px 7px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '2px',
              fontFamily: POPPINS,
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', lineHeight: 1 }}>
              #{editionNumber}
            </span>
            <span style={{ fontSize: '8px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Éd.
            </span>
          </div>
        )}
      </div>

      {/* ════════════ ZONE INFOS — 3 énergies ════════════ */}
      {/* Plancher à 30% (intermédiaire) mais extensible : flex-shrink-0 laisse */}
      {/* la zone grandir si le contenu augmente, la photo flex-1 absorbe le reste. */}
      <div
        ref={containerRef}
        className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{ minHeight: '30%', fontFamily: POPPINS, ...zoneStyle, paddingBottom: 'var(--app-nav-h, 0px)' }}
      >
        {/* ---------- CLUB : deux colonnes ---------- */}
        {energy === 'CLUB' && (
          <div className="flex-1 flex gap-3 px-4 pt-3.5 pb-2.5 min-h-0">
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span
                style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: inkMuted }}
                className="truncate"
              >
                {venue}
              </span>
              <h1
                className="line-clamp-2"
                style={{ fontSize: `${titleSize}px`, fontWeight: 900, textTransform: 'uppercase', color: ink, lineHeight: 1.08, margin: '5px 0' }}
              >
                {title}
              </h1>
              {heure && (
                <span style={{ fontSize: '12px', fontWeight: 600, color: inkMuted }}>{heure}</span>
              )}
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.14)' }} />
            <div className="flex flex-col items-end justify-center gap-1.5" style={{ minWidth: '32%' }}>
              {dateShort && (
                <span
                  style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: ink }}
                  className="truncate max-w-full"
                >
                  {dateShort}
                </span>
              )}
              <span
                style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', border: `1px solid ${hexToRgba(accentFull, 0.5)}`, color: accentBright, borderRadius: '3px', padding: '3px 7px' }}
                className="truncate max-w-full"
              >
                {ambiance}
              </span>
            </div>
          </div>
        )}

        {/* ---------- SCENE : style ticket ---------- */}
        {energy === 'SCENE' && (
          <div className="flex-1 flex flex-col justify-center px-4 pt-3.5 pb-2.5 min-h-0">
            <h1
              className="line-clamp-2"
              style={{ fontSize: `${titleSize}px`, fontWeight: 900, textTransform: 'uppercase', color: ink, lineHeight: 1.08, marginBottom: '10px' }}
            >
              {title}
            </h1>
            <div className="flex items-stretch gap-3">
              {[
                { label: 'Date', value: dateShort },
                { label: 'Lieu', value: venue },
                { label: 'Heure', value: heure },
              ].filter((cell) => cell.value).map((cell, i) => (
                <React.Fragment key={cell.label}>
                  {i > 0 && <div style={{ width: '1px', background: 'rgba(255,255,255,0.16)', alignSelf: 'stretch' }} />}
                  <div className="min-w-0">
                    <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
                      {cell.label}
                    </div>
                    <div className="truncate" style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.92)', textTransform: 'uppercase' }}>
                      {cell.value}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* ---------- JOURNEE : deux colonnes papier ---------- */}
        {energy === 'JOURNEE' && (
          <div className="flex-1 flex gap-3 px-4 pt-3.5 pb-2.5 min-h-0">
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <span
                style={{ alignSelf: 'flex-start', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: `1px solid ${hexToRgba(journeeAccent, 0.45)}`, color: journeeAccentInk, borderRadius: '3px', padding: '3px 7px' }}
              >
                {categoryLabel(event)}
              </span>
              <h1
                className="line-clamp-2"
                style={{ fontSize: `${titleSize}px`, fontWeight: 700, color: ink, lineHeight: 1.12, marginTop: '8px' }}
              >
                {title}
              </h1>
            </div>
            <div style={{ width: '1px', background: 'rgba(26,18,8,0.16)' }} />
            <div className="flex flex-col justify-center gap-2" style={{ minWidth: '36%' }}>
              {[
                { label: 'Jour', value: dateShort },
                { label: 'Heure', value: heure },
                { label: 'Lieu', value: venue },
              ].filter((meta) => meta.value).map((meta) => (
                <div key={meta.label} className="min-w-0">
                  <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(26,18,8,0.5)', marginBottom: '1px' }}>
                    {meta.label}
                  </div>
                  <div className="truncate" style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(26,18,8,0.85)', textTransform: 'uppercase' }}>
                    {meta.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------- Couche sociale ---------- */}
        {(event.friendsParticipating && event.friendsParticipating.length > 0) && (
          <div className="flex items-center gap-2 px-4 pb-1" style={{ flexShrink: 0 }}>
            <div className="flex -space-x-1">
              {event.friendsParticipating.slice(0, 3).map((friend) => (
                friend.avatar ? (
                  <img
                    key={friend.id}
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-4 h-4 rounded-full object-cover"
                    style={{ border: `1px solid ${isJournee ? journeeBg : adaptiveBg}` }}
                  />
                ) : (
                  <div
                    key={friend.id}
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ fontSize: '7px', fontWeight: 600, color: ink, background: hexToRgba(isJournee ? '#1A1208' : '#FFFFFF', 0.18), border: `1px solid ${isJournee ? journeeBg : adaptiveBg}` }}
                  >
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                )
              ))}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: inkMuted }} className="truncate">
              {getSocialProofText(event.friendsParticipating, event.totalParticipants || 0)}
            </span>
          </div>
        )}

        {/* ---------- Barre d'action : Prix | Bookmark + CTA ---------- */}
        <div
          className="flex items-center justify-between mt-auto"
          style={{
            height: '52px',
            flexShrink: 0,
            background: actionBarBg,
            padding: '0 14px',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 800, color: priceColor }}>
            {price.display}
          </span>
          <div className="flex items-center gap-2">
            {/* Bookmark = like / enregistrer */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="flex items-center justify-center rounded-full"
              style={{ width: '34px', height: '34px', border: isJournee ? '1px solid rgba(26,18,8,0.22)' : '1px solid rgba(255,255,255,0.22)' }}
              aria-label="Enregistrer"
            >
              <Bookmark style={{ width: '15px', height: '15px', color: ink }} />
            </motion.button>
            {/* CTA = participer */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleParticipate}
              style={{ background: isJournee ? '#1A1208' : '#FFFFFF', color: isJournee ? '#F5F0E8' : '#0A0A0A', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', borderRadius: '6px', padding: '9px 16px' }}
              aria-label="Participer"
            >
              {ctaLabel}
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
