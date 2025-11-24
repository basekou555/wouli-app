import React, { useState, useEffect, useRef } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Heart, Share2, Check, Menu, Search, Filter } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';

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
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isFirstEvent,
  onBack,
  onDislike,
  onLike,
  onParticipate,
  onShare,
  onMenuClick,
  onSearchClick,
  onFilterClick
}) => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracking du scroll pour animations futures (Phase 5)
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollY(containerRef.current.scrollTop);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-auto bg-background relative"
    >
      {/* ========== HEADER FIXED ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 h-15 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-full">
          {/* Gauche : Retour OU Menu */}
          <div className="w-10">
            {!isFirstEvent ? (
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
                aria-label="Retour"
              >
                <span className="text-xl">←</span>
              </button>
            ) : (
              <button
                onClick={onMenuClick}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Centre : Logo */}
          <span className="font-bold text-lg tracking-wide">WOULI</span>

          {/* Droite : Recherche + Filtres */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSearchClick}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onFilterClick}
              className="px-3 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========== CONTENT SCROLLABLE ========== */}
      <div className="pt-15">
        {/* Titre + Lieu - Scrollable, juste sous header */}
        <div className="px-4 py-3 bg-card border-b border-border">
          <h1 className="text-xl font-bold mb-1 text-foreground">
            {event.title}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span>📍</span>
            <span>{event.location}</span>
          </p>
        </div>

        {/* Image Immersive - 70vh */}
        <div className="relative w-full" style={{ height: '70vh' }}>
          <img
            src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
          {/* Gradient overlay subtil pour transition */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Sections Infos - PLACEHOLDER pour Phase 4 */}
        <div className="px-4 py-6 space-y-6 pb-40">
          <div className="text-center p-8 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-sm">
              📝 Sections détaillées à venir (Phase 4)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Date, Participants, Description, Établissement, Map
            </p>
          </div>
        </div>
      </div>

      {/* ========== BOUTONS D'ACTION FIXED BOTTOM ========== */}
      <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
        <div className="flex gap-3 max-w-md mx-auto">
          {/* Bouton Dislike (X) */}
          <button
            onClick={onDislike}
            className="flex-1 h-12 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
            aria-label="Passer"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Bouton Participer (✓) - Plus large */}
          <button
            onClick={onParticipate}
            className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
            aria-label="Participer"
          >
            <Check className="w-5 h-5" />
            <span>Participer</span>
          </button>

          {/* Bouton Like (♥) */}
          <button
            onClick={onLike}
            className="flex-1 h-12 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
            aria-label="J'aime"
          >
            <Heart className="w-5 h-5 text-pink-500" />
          </button>

          {/* Bouton Partager (↗️) */}
          {onShare && (
            <button
              onClick={onShare}
              className="flex-1 h-12 rounded-xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
              aria-label="Partager"
            >
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
