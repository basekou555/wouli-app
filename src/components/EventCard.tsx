import React, { useState, useEffect } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: UnifiedEvent;
  isFirstEvent?: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onFilterClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isFirstEvent = true,
  onBack,
  onMenuClick,
  onSearchClick,
  onFilterClick
}) => {
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position for future animations (Prompt 5)
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrollY(target.scrollTop);
    };

    const container = document.querySelector('.event-card-container');
    container?.addEventListener('scroll', handleScroll);

    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="event-card-container w-full h-screen overflow-y-auto bg-background relative">
      {/* HEADER FIXE */}
      <header className="fixed top-0 left-0 right-0 h-15 bg-background/95 backdrop-blur-md flex items-center justify-between px-4 z-[100] border-b border-border shadow-sm">
        {/* Bouton Retour (conditionnel) */}
        {!isFirstEvent && (
          <button
            onClick={onBack}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card hover:bg-accent flex items-center justify-center transition-colors border border-border shadow-sm"
            aria-label="Retour"
          >
            <span className="text-xl">←</span>
          </button>
        )}

        {/* Logo */}
        <div className={`flex items-center ${!isFirstEvent ? 'ml-12' : ''}`}>
          <span className="font-bold text-lg tracking-wide">WOULI</span>
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchClick}
            className="w-10 h-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
            aria-label="Recherche"
          >
            <span className="text-lg">🔍</span>
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className="text-sm font-medium"
          >
            Filtres
          </Button>
          <button
            onClick={onMenuClick}
            className="w-10 h-10 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
            aria-label="Menu"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>
      </header>

      {/* TITRE + LIEU (même ligne, optimisé) */}
      <div className="mt-15 pt-4 px-4 pb-3 flex items-center justify-between gap-3 bg-background border-b border-border">
        <h1 className="font-semibold text-lg text-foreground flex-1 truncate">
          🎉 {event.title}
        </h1>
        <span className="text-sm text-muted-foreground whitespace-nowrap flex items-center gap-1">
          📍 {event.location}
        </span>
      </div>

      {/* IMAGE IMMERSIVE */}
      <div className="relative w-full overflow-hidden" style={{ height: '70vh' }}>
        <img
          src={event.image_url || "https://picsum.photos/800/1200?random=event"}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* PLACEHOLDER CONTENT - Sections à venir dans Prompt 2 */}
      <div className="p-6 bg-background min-h-[30vh]">
        <p className="text-muted-foreground text-center py-8">
          📝 Sections à venir dans Prompt 2...
        </p>
        <div className="space-y-4 text-sm text-muted-foreground">
          <div>✓ Date & Horaires</div>
          <div>✓ Participants & Social Proof</div>
          <div>✓ Description détaillée</div>
          <div>✓ Prix & Infos pratiques</div>
          <div>✓ Boutons d'action</div>
        </div>
      </div>
    </div>
  );
};
