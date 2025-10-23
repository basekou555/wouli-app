import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface EventPreview {
  id: string;
  title: string;
  venue: string;
  time: string;
  urgency: string;
  location: string;
  participants: string;
  gradient: string;
}

const mockEvents: EventPreview[] = [
  {
    id: '1',
    title: 'Happy Hour @ Wallace Bar',
    venue: 'Wallace Bar',
    time: '18h-20h',
    urgency: 'CE SOIR',
    location: 'Vieux Lyon • 12 min',
    participants: '👥 Marie et 23 autres y vont',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: '2', 
    title: 'DJ Set @ Le Sucre',
    venue: 'Le Sucre',
    time: '23h',
    urgency: 'CE SOIR',
    location: 'Confluence • 8 min',
    participants: '👥 Paul et 45 autres y vont',
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: '3',
    title: 'Dégustation vins @ Cave Chromatique',
    venue: 'Cave Chromatique', 
    time: '19h',
    urgency: 'DANS 2H',
    location: 'Croix-Rousse • 15 min',
    participants: '👥 Sophie et 12 autres y vont',
    gradient: 'from-amber-500 to-red-500'
  },
  {
    id: '4',
    title: 'Blind Test @ Bieristan',
    venue: 'Bieristan',
    time: '20h30',
    urgency: 'CE SOIR',
    location: 'Bellecour • 5 min',
    participants: '👥 Lucas et 28 autres y vont',
    gradient: 'from-green-500 to-teal-500'
  },
  {
    id: '5',
    title: 'Lancer de haches @ L\'Hachez-Vous',
    venue: 'L\'Hachez-Vous',
    time: '18h',
    urgency: 'MAINTENANT',
    location: 'Part-Dieu • 10 min',
    participants: '👥 Camille et 18 autres y vont',
    gradient: 'from-orange-500 to-pink-500'
  }
];

const SwipePreview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      handleSwipe();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSwipe = (swipeDirection: 'left' | 'right' = 'right') => {
    if (isAnimating) return;
    
    setDirection(swipeDirection);
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockEvents.length);
      setIsAnimating(false);
    }, 300);
  };

  const getCardStyle = (index: number) => {
    if (index === 0) {
      // Carte de devant
      return `absolute inset-0 z-30 transition-all duration-300 ${
        isAnimating 
          ? direction === 'right' 
            ? 'animate-slide-right' 
            : 'animate-slide-left'
          : 'transform-none'
      }`;
    } else if (index === 1) {
      // Carte du milieu
      return 'absolute inset-0 z-20 transform -rotate-2 scale-[0.98] transition-all duration-500';
    } else {
      // Carte de fond
      return 'absolute inset-0 z-10 transform rotate-3 scale-[0.95] opacity-60 transition-all duration-500';
    }
  };

  const getVisibleEvents = () => {
    const events = [];
    for (let i = 0; i < 3; i++) {
      const eventIndex = (currentIndex + i) % mockEvents.length;
      events.push({ ...mockEvents[eventIndex], displayIndex: i });
    }
    return events;
  };

  return (
    <div className="relative w-80 h-96 mx-auto my-8 md:w-80 md:h-96 sm:w-72 sm:h-80">
      {getVisibleEvents().map((event, index) => (
        <div
          key={`${event.id}-${currentIndex}-${index}`}
          className={getCardStyle(index)}
          onMouseEnter={() => index === 0 && setHoveredCard(event.id)}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => index === 0 && handleSwipe()}
          style={{ cursor: index === 0 ? 'pointer' : 'default' }}
        >
          <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Image événement */}
            <div className={`h-3/4 bg-gradient-to-br ${event.gradient} relative`}>
              <div className="p-4 text-white">
                <span className="bg-urgent text-urgent-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {event.urgency}
                </span>
              </div>
              
              {/* Indicateurs swipe - visibles au hover */}
              {index === 0 && hoveredCard === event.id && (
                <>
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2 transition-opacity duration-200">
                    <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg rotate-12 shadow-lg flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      NOPE
                    </div>
                  </div>
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2 transition-opacity duration-200">
                    <div className="bg-success text-success-foreground px-4 py-2 rounded-lg -rotate-12 shadow-lg flex items-center gap-2">
                      LIKE
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Info événement */}
            <div className="p-4 h-1/4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground truncate">
                  {event.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {event.time} • {event.location}
                </p>
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {event.participants}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Indicateur de position */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {mockEvents.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex 
                ? 'bg-primary' 
                : 'bg-neutral-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SwipePreview;