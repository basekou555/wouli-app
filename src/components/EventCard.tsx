import React, { useState, useEffect } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { Menu, Filter } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { getSocialProofText, getPriceInfo, formatEventDateTime } from '@/utils/eventCardHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: UnifiedEvent;
  isFirstEvent: boolean;
  onBack: () => void;
  onDislike: () => void;
  onLike: () => void;
  onParticipate: () => void;
  onShare?: () => void;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
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
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      className="aspect-square rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center text-3xl font-bold relative overflow-hidden"
      aria-label="Participer"
    >
      {/* Animation success */}
      {isAnimating && (
        <>
          {/* Onde de succès */}
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-white rounded-full"
          />
          
          {/* Confetti (4 particules) */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                scale: 0, 
                x: 0, 
                y: 0,
                opacity: 1 
              }}
              animate={{ 
                scale: [0, 1, 0],
                x: Math.cos(i * Math.PI / 2) * 50,
                y: Math.sin(i * Math.PI / 2) * 50,
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 0.6,
                ease: 'easeOut'
              }}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                top: '50%',
                left: '50%',
              }}
            />
          ))}
        </>
      )}
      
      {/* Icône */}
      <motion.span
        animate={isAnimating ? { 
          scale: [1, 1.3, 1],
          rotate: [0, 15, -15, 0]
        } : {}}
        transition={{ duration: 0.4 }}
        className="text-white"
      >
        ✓
      </motion.span>
    </motion.button>
  );
};

const EventCard: React.FC<EventCardProps> = ({
  event,
  isFirstEvent,
  onBack,
  onDislike,
  onLike,
  onParticipate,
  onShare,
  onMenuClick,
  onFilterClick,
  onEstablishmentClick,
  onMapClick
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Cacher l'indicateur "Swipe up" après 3 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full relative overflow-hidden bg-neutral-900">
      {/* Image plein écran en background - DOIT être en premier */}
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="w-full h-full bg-neutral-800 animate-pulse" />
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Header fixe minimaliste transparent */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between"
        style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
      >
        {!isFirstEvent ? (
          <motion.button
            whileTap={{ scale: 0.9, y: -5 }}
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Retour"
          >
            <motion.span 
              className="text-white text-xl drop-shadow-lg"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              ↑
            </motion.span>
          </motion.button>
        ) : (
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-white drop-shadow-lg" />
          </button>
        )}
        
        <span className="font-bold text-lg tracking-wider text-white drop-shadow-lg">
          WOULI
        </span>
        
        <button
          onClick={onFilterClick}
          className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900 hover:bg-white transition-colors flex items-center gap-1"
        >
          <Filter className="w-3 h-3" />
          Filtres
        </button>
      </header>

      {/* Contenu par-dessus */}
      <div className="relative z-10 flex-1 flex flex-col justify-end pb-32 px-4">
        {/* Titre + Lieu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg mb-2 line-clamp-2">
            {event.title}
          </h1>
          <p className="text-white/90 text-sm flex items-center gap-1">
            📍 {event.venue || event.location}
          </p>
        </motion.div>

        {/* Infos essentielles (Date/Prix/Participants) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 bg-black/40 backdrop-blur-md rounded-2xl p-4 mb-4"
        >
          {/* Date + Heure */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-lg">📅</span>
            <span className="text-sm font-medium">
              {formatEventDateTime(event.date, event.time)}
            </span>
          </div>

          {/* Prix */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-lg">💰</span>
            <span className="text-sm font-semibold text-yellow-400">
              {getPriceInfo(event.price_text).display}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-white">
            <span className="text-lg">👥</span>
            <span className="text-sm font-medium">
              {getSocialProofText(event.friendsParticipating || [], event.totalParticipants || 0)}
            </span>
          </div>
        </motion.div>

        {/* Bouton Voir plus de détails */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setIsDetailsOpen(true)}
          className="w-full py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          Voir plus de détails →
        </motion.button>

        {/* Indicateur Swipe up animé */}
        <AnimatePresence>
          {showSwipeHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              exit={{ opacity: 0 }}
              transition={{ 
                opacity: { duration: 0.3 },
                y: { repeat: Infinity, duration: 1.5 }
              }}
              className="text-center text-white/60 text-xs mt-4"
            >
              ↑ Swipe pour voir plus ↑
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Boutons bottom */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-4 gap-3 px-4 pb-4 max-w-md mx-auto">
          {/* Bouton Dislike */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onDislike}
            className="aspect-square rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center text-2xl"
            aria-label="Passer"
          >
            ❌
          </motion.button>

          {/* Bouton Participer - ANIMATION SPÉCIALE */}
          <ParticipateButton onClick={onParticipate} />

          {/* Bouton Like */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onLike}
            className="aspect-square rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500/30 transition-colors flex items-center justify-center text-2xl"
            aria-label="J'aime"
          >
            ❤️
          </motion.button>

          {/* Bouton Partager - PAS D'ANIMATION spéciale */}
          <button
            onClick={onShare}
            className="aspect-square rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors flex items-center justify-center text-xl"
            aria-label="Partager"
          >
            ↗️
          </button>
        </div>
      </div>

      {/* Drawer détails */}
      <AnimatePresence>
        {isDetailsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              {/* Handle de fermeture */}
              <div className="sticky top-0 bg-background py-4 px-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Détails de l'événement</h2>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-2 hover:bg-accent rounded-full"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              
              {/* Contenu drawer */}
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
                  <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                    🏢 Organisateur
                  </h3>
                  <button
                    onClick={onEstablishmentClick}
                    className="w-full flex items-center gap-4 p-4 bg-accent rounded-lg hover:bg-accent/80 transition-colors"
                  >
                    {/* Logo établissement */}
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
                    
                    {/* Infos établissement */}
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-base">
                        {event.venue || event.location}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Voir l'établissement →
                      </p>
                    </div>
                  </button>
                </div>

                {/* Map */}
                <div>
                  <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                    📍 Localisation
                  </h3>
                  <button
                    onClick={onMapClick}
                    className="w-full h-[200px] rounded-lg overflow-hidden bg-muted relative group"
                  >
                    {event.address ? (
                      <img
                        src={getStaticMapUrl(getLyonCoordinates().lat, getLyonCoordinates().lon)}
                        alt={`Carte de ${event.location}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <span className="text-4xl mb-2">📍</span>
                        <span className="text-sm">Adresse non disponible</span>
                      </div>
                    )}
                    
                    {/* Overlay au hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white font-semibold text-sm bg-black/50 px-4 py-2 rounded-full">
                        Ouvrir dans Maps
                      </span>
                    </div>
                  </button>
                  
                  {/* Adresse texte */}
                  {event.address && (
                    <p className="mt-3 text-sm text-muted-foreground text-center">
                      📍 {event.address}
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