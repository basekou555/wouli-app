import React, { useState, useEffect, useRef } from 'react';
import { Menu, SlidersHorizontal, X, Check, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MockEvent {
  id: string;
  title: string;
  location: string;
  time: string;
  gradient: string;
  tag: string;
}

const mockEvents: MockEvent[] = [
  {
    id: '1',
    title: 'Happy Hour @ Wallace Bar',
    location: 'Vieux Lyon • 12 min',
    time: '18h-20h',
    gradient: 'from-purple-500 to-pink-500',
    tag: 'CE SOIR'
  },
  {
    id: '2',
    title: 'DJ Set @ Le Sucre',
    location: 'Confluence • 8 min',
    time: '23h',
    gradient: 'from-blue-500 to-purple-600',
    tag: 'CE SOIR'
  },
  {
    id: '3',
    title: 'Dégustation vins @ Cave Chromatique',
    location: 'Croix-Rousse • 15 min',
    time: '19h',
    gradient: 'from-amber-500 to-red-500',
    tag: 'DANS 2H'
  },
  {
    id: '4',
    title: 'Blind Test @ Bieristan',
    location: 'Bellecour • 5 min',
    time: '20h30',
    gradient: 'from-green-500 to-teal-500',
    tag: 'CE SOIR'
  }
];

const MiniEventCard: React.FC<{ event: MockEvent }> = ({ event }) => (
  <div className="h-full snap-start snap-always flex flex-col">
    {/* Mini Header */}
    <div className="flex items-center justify-between px-3 py-2 bg-card/95 backdrop-blur-sm">
      <Menu className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        WOULI
      </span>
      <div className="flex items-center gap-1 text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
        <SlidersHorizontal className="w-2 h-2" />
        Filtres
      </div>
    </div>

    {/* Image avec gradient */}
    <div className={`flex-1 bg-gradient-to-br ${event.gradient} relative`}>
      {/* Badge urgence */}
      <div className="absolute top-2 left-2">
        <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded-full">
          {event.tag}
        </span>
      </div>
      
      {/* Overlay bas pour lisibilité */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-1/3" />
    </div>

    {/* Info section */}
    <div className="px-3 py-2 bg-card border-t border-border">
      <p className="text-[10px] font-bold text-foreground line-clamp-1">{event.title}</p>
      <p className="text-[8px] text-muted-foreground flex items-center gap-1 mt-0.5">
        <span>📍</span> {event.location}
      </p>
      <div className="flex gap-1.5 mt-1.5">
        <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[7px] font-medium rounded-full">
          {event.time}
        </span>
        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[7px] font-medium rounded-full">
          Gratuit
        </span>
      </div>
    </div>

    {/* Mini boutons d'action */}
    <div className="flex gap-2 px-3 py-2 bg-card border-t border-border">
      <div className="flex-1 h-6 bg-muted rounded-lg flex items-center justify-center">
        <X className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="flex-[2] h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center gap-1">
        <Check className="w-3 h-3 text-white" />
        <span className="text-[8px] text-white font-medium">Participer</span>
      </div>
      <div className="flex-1 h-6 bg-muted rounded-lg flex items-center justify-center">
        <Heart className="w-3 h-3 text-pink-500" />
      </div>
    </div>
  </div>
);

const ScrollPreview: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockEvents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll programmatique vers la carte active
  useEffect(() => {
    if (containerRef.current) {
      const cardHeight = containerRef.current.clientHeight / 1; // Une carte visible à la fois
      containerRef.current.scrollTo({
        top: currentIndex * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  return (
    <div className="max-w-[240px] mx-auto">
      {/* Mockup téléphone */}
      <div className="relative aspect-[9/19] bg-black rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl z-20" />

        {/* Contenu scrollable */}
        <div
          ref={containerRef}
          className="h-full overflow-hidden snap-y snap-mandatory scroll-smooth"
        >
          {mockEvents.map((event) => (
            <div key={event.id} className="h-full">
              <MiniEventCard event={event} />
            </div>
          ))}
        </div>

        {/* Indicateur de scroll vertical */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30">
          {mockEvents.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-300",
                i === currentIndex 
                  ? "bg-white h-4" 
                  : "bg-white/40 h-1.5"
              )}
            />
          ))}
        </div>
      </div>

      {/* Légende sous le mockup */}
      <p className="text-center text-white/70 text-sm mt-4">
        ↕️ Scroll pour découvrir
      </p>
    </div>
  );
};

export default ScrollPreview;
