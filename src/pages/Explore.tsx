
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Search, Heart, X, Star, MessageCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for event cards
const mockEvents = [
  {
    id: '1',
    title: 'Soirée cocktails',
    image: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'Venez déguster des cocktails signature dans un cadre élégant',
    location: 'Le Perchoir, Paris',
    date: '2025-05-20T20:00:00',
    organizer: 'Julien D.',
    distance: '2.5 km'
  },
  {
    id: '2',
    title: 'Exposition d\'art contemporain',
    image: 'https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'Découvrez les œuvres de jeunes artistes émergents',
    location: 'Galerie Moderne, Lyon',
    date: '2025-05-22T18:30:00',
    organizer: 'Marie L.',
    distance: '3.8 km'
  },
  {
    id: '3',
    title: 'Concert jazz en plein air',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'Une soirée musicale sous les étoiles avec les meilleurs musiciens de jazz',
    location: 'Jardin Public, Bordeaux',
    date: '2025-05-25T21:00:00',
    organizer: 'Thomas B.',
    distance: '1.2 km'
  }
];

const Explore: React.FC = () => {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentEvent = mockEvents[currentIndex];

  const handleSwipe = (dir: string) => {
    setDirection(dir);
    
    // Reset after animation completes
    setTimeout(() => {
      if (currentIndex < mockEvents.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Reset to beginning if we've gone through all cards
        setCurrentIndex(0);
      }
      setDirection(null);
    }, 300);
  };
  
  const handleLike = () => handleSwipe('right');
  const handleDislike = () => handleSwipe('left');
  const handleSuperLike = () => handleSwipe('up');

  return (
    <AppLayout>
      <div className="py-4 md:py-6 space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Explorer</h1>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Rechercher des événements, groupes..." 
              className="pl-9 py-2 h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-full focus:ring-purple-500 focus:border-purple-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            size={isMobile ? "sm" : "default"}
            className="rounded-full"
          >
            Rechercher
          </Button>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          {/* Tinder-style card stack */}
          <div className="relative w-full max-w-sm h-[460px] mx-auto">
            <AnimatePresence>
              {currentEvent && direction === null && (
                <motion.div
                  key={currentEvent.id}
                  className="absolute w-full h-full"
                  initial={{ scale: 0.95, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{
                    x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
                    y: direction === 'up' ? -300 : 0,
                    opacity: 0,
                    scale: 0.95
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="w-full h-full overflow-hidden rounded-2xl shadow-xl border-none">
                    <div className="relative w-full h-full">
                      {/* Event image */}
                      <div className="absolute inset-0">
                        <img 
                          src={currentEvent.image} 
                          alt={currentEvent.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
                      </div>
                      
                      {/* Event info */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <div className="flex items-end justify-between">
                          <div>
                            <h3 className="text-2xl font-bold">{currentEvent.title}</h3>
                            <p className="text-white/80 flex items-center text-sm mt-1">
                              <span className="bg-white/20 px-2 py-0.5 rounded-full">
                                {new Date(currentEvent.date).toLocaleDateString('fr-FR', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="mx-2">•</span>
                              <span>{currentEvent.distance}</span>
                            </p>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
                            <p className="text-sm font-medium">Par {currentEvent.organizer}</p>
                          </div>
                        </div>
                        
                        <p className="mt-3 text-white/90 line-clamp-3">
                          {currentEvent.description}
                        </p>
                        
                        <p className="mt-3 text-sm text-white/70">
                          {currentEvent.location}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button 
              onClick={handleDislike}
              size="icon" 
              variant="outline"
              className="w-12 h-12 rounded-full border-gray-300 bg-white shadow-md hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Button 
              onClick={handleSuperLike}
              size="icon" 
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 shadow-md hover:shadow-lg transition-all"
            >
              <Star className="h-5 w-5 text-white" />
            </Button>
            
            <Button 
              onClick={handleLike}
              size="icon" 
              variant="outline"
              className="w-12 h-12 rounded-full border-gray-300 bg-white shadow-md hover:bg-green-50 hover:border-green-200 hover:text-green-500 transition-colors"
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-500 flex items-center gap-2"
              onClick={() => setCurrentIndex(0)}
            >
              <RefreshCw className="h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
