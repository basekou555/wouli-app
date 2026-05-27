import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { X, MapPin, Bookmark } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { getPriceInfo, formatEventDateTime } from '@/utils/eventCardHelpers';
import { getFocusClass } from '@/utils/imageHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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

// --- Helpers ---

type Energy = 'SCENE' | 'CLUB' | 'JOURNEE';

const DJ_SIGNALS = ['dj', 'dj set', 'mix', 'b2b'];
const SCENE_KEYWORDS = ['concert', 'live', 'spectacle', 'théâtre', 'theatre', 'show', 'tournée', 'tournee', 'récital', 'recital'];
const SCENE_VENUE_KEYWORDS = ['salle', 'théâtre', 'theatre', 'concert', 'opéra', 'opera'];

function deriveEnergy(event: UnifiedEvent): Energy {
  if (event.energy) return event.energy;

  const titleLow = (event.title || '').toLowerCase();
  const musicLow = (event.music_style || '').toLowerCase();
  const activityLow = (event.activity_type || '').toLowerCase();
  const venueCatLow = (event.venue_category || '').toLowerCase();

  // 1. DJ signal → CLUB sans exception
  const hasDJ = DJ_SIGNALS.some(s =>
    titleLow.includes(s) || musicLow.includes(s)
  );
  if (hasDJ) return 'CLUB';

  // 2. SCENE : concert/spectacle sans signal DJ
  const hasSceneSignal = SCENE_KEYWORDS.some(k =>
    musicLow.includes(k) || activityLow.includes(k) || titleLow.includes(k)
  );
  const hasSceneVenue = SCENE_VENUE_KEYWORDS.some(k => venueCatLow.includes(k));
  if (hasSceneSignal || hasSceneVenue) return 'SCENE';

  // 3. CLUB : soirée tardive
  const isSoiree = event.event_type === 'soirees' || event.category === 'soirees';
  if (isSoiree) {
    const hour = event.time ? parseInt(event.time.split(':')[0], 10) : -1;
    if (hour === -1 || hour >= 22 || hour < 6) return 'CLUB';
  }

  return 'JOURNEE';
}

// Tags inserted by the scraper as metadata — not real subtitle content
// Handles look like: lowercase, no spaces, dots/underscores only (e.g. "nh.club.lyon")
function isMetadataTag(tag: string): boolean {
  if (SOURCE_NAMES.test(tag.trim())) return true;
  return /^[a-z0-9._]+$/.test(tag.trim());
}

function deriveSubtitle(event: UnifiedEvent): string | null {
  if (event.subtitle) return event.subtitle;
  if (event.music_style) return event.music_style;
  if (event.ambiance) return event.ambiance;
  if (event.activity_type) return event.activity_type;
  if (event.tags && event.tags.length > 0) {
    const realTag = event.tags.find(t => !isMetadataTag(t));
    if (realTag) return realTag;
  }
  return null;
}

function hexToHsl(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m || m.length < 3) return null;
  const r = parseInt(m[0], 16) / 255;
  const g = parseInt(m[1], 16) / 255;
  const b = parseInt(m[2], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function adjustColor(hex: string, lightnessOffset: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  const [h, s, l] = hsl;
  return hslToHex(h, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l + lightnessOffset)));
}

function extractCardColor(imgEl: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(imgEl, 0, 0, 10, 10);
    const data = ctx.getImageData(0, 0, 10, 10).data;
    let r = 0, g = 0, b = 0;
    const count = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]; g += data[i + 1]; b += data[i + 2];
    }
    const toHex = (v: number) => Math.round(v / count).toString(16).padStart(2, '0');
    const rawHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    const hsl = hexToHsl(rawHex);
    if (!hsl) return null;
    const [h, s, l] = hsl;
    return hslToHex(h, Math.max(0, s - 20), Math.max(0, l - 25));
  } catch {
    return null;
  }
}

function getTitleFontSize(title: string, isRecurring: boolean, energy: Energy): string {
  const base = title.length <= 10 ? 28 : title.length <= 16 ? 22 : 18;
  const size = isRecurring ? (base === 28 ? 22 : base === 22 ? 18 : 14) : base;
  return `${size}px`;
}

// Source names that can leak into venue/location/organizer fields
const SOURCE_NAMES = /^(instagram|facebook|twitter|tiktok|utilisateur|user|Utilisateur)$/i;

function getVenueName(event: UnifiedEvent): string {
  for (const c of [event.venue, event.organizer, event.location]) {
    if (c && c.trim() && !SOURCE_NAMES.test(c.trim())) return c.trim();
  }
  return 'Lyon';
}

// For the venue display line — event.venue (business) ou event.location (scraped/admin)
// Filtre : source names, city+country pattern ("Lyon, France 🇫🇷"), flag emojis
function isLocationNoise(value: string): boolean {
  if (SOURCE_NAMES.test(value.trim())) return true;
  // "City, Country" pattern — contient une virgule → probablement pas un lieu précis
  if (value.includes(',')) return true;
  // Flag emoji (regional indicator symbols U+1F1E0–U+1F1FF)
  if (/\p{RI}/u.test(value)) return true;
  return false;
}

function getDisplayVenue(event: UnifiedEvent): string | null {
  for (const c of [event.venue, event.location]) {
    if (c && c.trim() && !isLocationNoise(c.trim())) return c.trim();
  }
  return null;
}

function isBadTitleStart(title: string): boolean {
  const first = title.codePointAt(0) ?? 0;
  if (first >= 0x1F000) return true;                    // emoji (most ranges)
  if (first >= 0x2600 && first <= 0x27FF) return true;  // misc symbols & dingbats
  if (first >= 0x2190 && first <= 0x21FF) return true;  // arrows
  const ch = title[0];
  return ch === '#' || (ch >= '0' && ch <= '9');
}

function cleanTitle(event: UnifiedEvent): string {
  const raw = (event.title || '').trim();
  const words = raw.split(/\s+/).filter(Boolean);
  if (raw.length > 0 && words.length <= 5 && !isBadTitleStart(raw)) return raw;
  if (raw.length > 0) return words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
  return getVenueName(event);
}

const getLyonCoordinates = () => ({ lat: 45.7640, lon: 4.8357 });

const getMapUrl = (lat: number, lon: number) =>
  `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=600x300&markers=${lat},${lon},red-pushpin`;

// --- Component ---

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
  const [colorCard, setColorCard] = useState<string | null>(event.color_card || null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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

  // Sync server-provided color_card if event changes
  useEffect(() => {
    if (event.color_card) setColorCard(event.color_card);
  }, [event.color_card]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    // Server color takes priority; only attempt extraction if not provided
    if (!event.color_card && imgRef.current) {
      const extracted = extractCardColor(imgRef.current);
      if (extracted) setColorCard(extracted);
    }
  }, [event.color_card]);

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

  const energy = deriveEnergy(event);
  const displayTitle = cleanTitle(event);
  const subtitle = deriveSubtitle(event);
  const displayVenue = getDisplayVenue(event);
  const rawPrice = getPriceInfo(event.price_text);
  // Ajouter "€" si le service a converti price (numeric) en string sans symbole
  const priceDisplay = rawPrice.isFree ? 'Gratuit'
    : /^\d+(\.\d+)?$/.test(rawPrice.display)
      ? `${Math.round(parseFloat(rawPrice.display))}€`
      : rawPrice.display;
  const priceInfo = { ...rawPrice, display: priceDisplay };
  const isRecurring = event.is_recurring === true;

  const FALLBACK_COLOR = '#1C1A1A';
  const baseColor = colorCard || FALLBACK_COLOR;
  const adaptiveBg = energy === 'JOURNEE' ? adjustColor(baseColor, 8) : baseColor;
  const freePriceColor = adjustColor(baseColor, 20);

  const titleSize = getTitleFontSize(event.title || '', isRecurring, energy);
  const titleClass = energy === 'JOURNEE'
    ? 'font-semibold'
    : 'font-extrabold uppercase';

  const ctaLabel = priceInfo.isFree ? "C'est gratuit ce soir →" : "J'y vais →";

  const friends = event.friendsParticipating || [];
  const extraFriends = friends.length > 3 ? friends.length - 3 : 0;

  return (
    <div className="w-full h-full flex flex-col font-['Poppins']">

      {/* Zone Photo — prend l'espace restant, min 55% */}
      <div
        className="relative overflow-hidden flex-1 min-h-0 cursor-pointer"
        style={{ minHeight: '55%', boxShadow: `inset 0 -60px 40px -20px ${adaptiveBg}` }}
        onClick={() => setShowImageModal(true)}
      >
        {/* Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>
        )}

        {/* Photo */}
        <img
          ref={imgRef}
          src={getProxiedImageUrl(event.image_url) || 'https://picsum.photos/400/600?random=event'}
          alt={event.title}
          crossOrigin="anonymous"
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            getFocusClass(event.image_focus_position),
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="eager"
        />

        {/* Badge UNIQUE */}
        {event.is_unique && (
          <span
            className="absolute top-3 right-3 uppercase tracking-[0.08em]"
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '7px',
              fontWeight: 500,
              background: 'rgba(255,255,255,0.10)',
              border: '0.5px solid rgba(255,255,255,0.18)',
              borderRadius: '3px',
              padding: '2px 6px',
              color: '#FFFFFF',
            }}
          >
            UNIQUE
          </span>
        )}
      </div>

      {/* Zone Adaptative — min 38%, s'adapte au contenu */}
      <div
        className="flex-shrink-0 flex flex-col font-['Poppins'] transition-colors duration-300"
        style={{ background: adaptiveBg, minHeight: '38%' }}
      >
        {/* Contenu */}
        <div className="flex-1 flex flex-col px-4 pt-3 pb-2 gap-1 min-h-0 overflow-hidden">

          {/* Titre */}
          <h1
            className={cn('text-white leading-tight line-clamp-2', titleClass)}
            style={{ fontSize: titleSize }}
          >
            {displayTitle}
          </h1>

          {/* Nom du lieu — caché si identique au titre (évite le doublon) */}
          {displayVenue && displayVenue.toLowerCase() !== displayTitle.toLowerCase() && (
            <p
              className="leading-none uppercase truncate"
              style={{
                fontSize: '10px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.1em',
              }}
            >
              {displayVenue}
            </p>
          )}

          {/* Sous-titre */}
          {subtitle && (
            <p
              className="uppercase leading-none"
              style={{
                fontSize: '11px',
                fontWeight: energy === 'SCENE' ? 500 : 400,
                color: energy === 'SCENE'
                  ? 'rgba(255,255,255,0.6)'
                  : 'rgba(255,255,255,0.55)',
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Metadata */}
          <p className="text-white/70 leading-none" style={{ fontSize: '10px', fontWeight: 400 }}>
            {formatEventDateTime(event.date, event.time)}
            {energy === 'JOURNEE' && event.end_date && ` – ${formatEventDateTime(event.end_date)}`}
          </p>

          {/* Couche sociale */}
          {friends.length > 0 ? (
            <div className="flex items-center gap-1.5 h-6 flex-shrink-0">
              <div className="flex -space-x-1.5">
                {friends.slice(0, 3).map((friend) =>
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
                      className="w-5 h-5 rounded-full border border-white/40 bg-white/20 flex items-center justify-center text-[9px] font-bold text-white"
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                  )
                )}
                {extraFriends > 0 && (
                  <div className="w-5 h-5 rounded-full border border-white/40 bg-white/20 flex items-center justify-center text-[8px] font-bold text-white">
                    +{extraFriends}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>
                {friends.length === 1 ? `${friends[0].name} y va` : `${friends.length} amis intéressés`}
              </span>
            </div>
          ) : (
            <div className="h-0" />
          )}
        </div>

        {/* Barre d'action */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-3.5"
          style={{ height: '52px', background: 'rgba(0,0,0,0.20)' }}
        >
          {/* Prix */}
          <span
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: priceInfo.isFree ? freePriceColor : '#FFFFFF',
            }}
          >
            {priceInfo.isFree ? 'Gratuit' : priceInfo.display}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Bookmark */}
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="flex items-center justify-center rounded-full flex-shrink-0"
              style={{
                width: '30px',
                height: '30px',
                border: '0.5px solid rgba(255,255,255,0.18)',
              }}
              aria-label="Sauvegarder"
            >
              <Bookmark style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.5)' }} />
            </button>

            {/* CTA */}
            <button
              onClick={(e) => { e.stopPropagation(); handleParticipate(); }}
              className="rounded flex-shrink-0"
              style={{
                background: '#FFFFFF',
                color: '#0A0A0A',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '7px 13px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              {ctaLabel}
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
                <div>
                  <h3 className="text-sm font-semibold mb-1.5 uppercase tracking-wider text-muted-foreground">Description</h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                    {event.description || 'Aucune description disponible'}
                  </p>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Organisateur</h3>
                  <button
                    onClick={onEstablishmentClick}
                    className="w-full flex items-center gap-3 p-3.5 bg-muted/50 rounded-2xl hover:bg-muted transition-colors border border-border/50"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {event.venue_logo ? (
                        <img src={event.venue_logo} alt={getVenueName(event)} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-primary/10">🏢</div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{getVenueName(event)}</p>
                      <p className="text-xs text-muted-foreground">Voir l'établissement →</p>
                    </div>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Localisation</h3>
                  <button
                    onClick={onMapClick}
                    className="w-full h-[160px] rounded-2xl overflow-hidden bg-muted relative group border border-border/50"
                  >
                    {event.address ? (
                      <img
                        src={getMapUrl(getLyonCoordinates().lat, getLyonCoordinates().lon)}
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
              src={getProxiedImageUrl(event.image_url) || 'https://picsum.photos/400/600?random=event'}
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
