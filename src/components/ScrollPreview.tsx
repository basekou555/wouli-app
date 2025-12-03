import React, { useState, useEffect } from 'react';
import { Menu, SlidersHorizontal, X, Check, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  <motion.div 
    className="h-full flex flex-col"
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.1, duration: 0.3 }}
  >
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
      {/* Badge urgence avec animation pulse */}
      <div className="absolute top-2 left-2">
        <motion.span 
          className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-bold rounded-full inline-block"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          {event.tag}
        </motion.span>
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
        <motion.span 
          className="px-1.5 py-0.5 bg-primary/10 text-primary text-[7px] font-medium rounded-full"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {event.time}
        </motion.span>
        <motion.span 
          className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[7px] font-medium rounded-full"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          Gratuit
        </motion.span>
      </div>
    </div>

    {/* Mini boutons d'action */}
    <div className="flex gap-2 px-3 py-2 bg-card border-t border-border">
      <motion.div 
        className="flex-1 h-6 bg-muted rounded-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </motion.div>
      <motion.div 
        className="flex-[2] h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center gap-1"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Check className="w-3 h-3 text-white" />
        <span className="text-[8px] text-white font-medium">Participer</span>
      </motion.div>
      <motion.div 
        className="flex-1 h-6 bg-muted rounded-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Heart className="w-3 h-3 text-pink-500" />
      </motion.div>
    </div>
  </motion.div>
);

// Variants d'animation pour le slide vertical
const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

const ScrollPreview: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto-scroll toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % mockEvents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[240px] mx-auto">
      {/* Mockup téléphone */}
      <div className="relative aspect-[9/19] bg-black rounded-[2.5rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-black rounded-b-xl z-20" />

        {/* Contenu animé avec AnimatePresence */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              y: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0"
          >
            <MiniEventCard event={mockEvents[currentIndex]} />
          </motion.div>
        </AnimatePresence>

        {/* Indicateurs de scroll animés avec spring */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30">
          {mockEvents.map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              animate={{
                height: i === currentIndex ? 16 : 6,
                backgroundColor: i === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.4)',
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
