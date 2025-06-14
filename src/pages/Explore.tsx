
import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Search, Users, Filter, Heart, X, Star } from 'lucide-react';
import { motion, PanInfo, useAnimation } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAllEvents } from '@/hooks/useAllEvents';
import { UnifiedEvent } from '@/types/unified';
import { WOULI_CATEGORIES, getCategoryName, getCategoryIcon } from '@/data/wouliCategories';
import { PageSkeleton } from '@/components/LoadingSkeleton';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const Explore = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'friends'
  const [showSearch, setShowSearch] = useState(false);
  const controls = useAnimation();
  const { toast } = useToast();
  
  const { events: allEvents, loading } = useAllEvents();

  // Filter events based on search and filter
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For demo purposes, treat business events as "public" and user events as "friends"
    const matchesFilter = filter === 'all' || 
      (filter === 'public' && event.source === 'business') ||
      (filter === 'friends' && event.source === 'user');
    
    return matchesSearch && matchesFilter;
  });

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
    setCurrentIndex(0);
  };

  const performSearch = () => {
    setCurrentIndex(0);
  };

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      // Swiped right (like)
      handleLike();
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left (pass)
      handlePass();
    } else {
      // Reset if not swiped far enough
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleLike = () => {
    controls.start({ 
      x: 300, 
      opacity: 0,
      transition: { duration: 0.3 } 
    }).then(() => {
      toast({
        title: "J'aime !",
        description: `Vous avez aimé "${filteredEvents[currentIndex]?.title}"`,
      });
      moveToNextCard();
    });
  };

  const handlePass = () => {
    controls.start({ 
      x: -300, 
      opacity: 0,
      transition: { duration: 0.3 } 
    }).then(() => {
      moveToNextCard();
    });
  };

  const handleSave = () => {
    toast({
      title: "Sauvegardé",
      description: `${filteredEvents[currentIndex]?.title} a été ajouté à vos favoris`,
    });
  };

  const moveToNextCard = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Reached the end of the cards
      toast({
        title: "C'est tout !",
        description: "Vous avez parcouru tous les événements disponibles",
      });
      // Optionally restart or show end screen
      setCurrentIndex(0);
    }
    controls.start({ x: 0, opacity: 1 });
  };

  const currentEvent = filteredEvents[currentIndex];

  if (loading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Découvrir</h1>
          <p className="text-gray-500">Trouvez de nouvelles activités qui pourraient vous plaire</p>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              onClick={() => handleFilter('all')}
              size="sm"
              className="rounded-full"
            >
              Tous
            </Button>
            <Button 
              variant={filter === 'public' ? 'default' : 'outline'} 
              onClick={() => handleFilter('public')}
              size="sm"
              className="rounded-full"
            >
              Établissements
            </Button>
            <Button 
              variant={filter === 'friends' ? 'default' : 'outline'} 
              onClick={() => handleFilter('friends')}
              size="sm"
              className="rounded-full"
            >
              Utilisateurs
            </Button>
          </div>
        </div>
        
        {/* Search drawer (collapsible) */}
        {showSearch && (
          <div className="flex space-x-2 items-center pb-2 pt-1">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un événement ou un lieu"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={performSearch}>Chercher</Button>
          </div>
        )}
        
        {/* Card swiper */}
        {filteredEvents.length > 0 ? (
          <div className="relative h-[70vh] flex items-center justify-center">
            <motion.div
              className="absolute w-full max-w-md"
              animate={controls}
              initial={{ x: 0, opacity: 1 }}
              drag="x"
              dragConstraints={{ left: -10, right: 10 }}
              onDragEnd={handleSwipe}
              whileTap={{ scale: 1.05 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                {/* Card Image */}
                <div className="relative w-full h-96">
                  <img
                    src={currentEvent?.image_url || "https://picsum.photos/400/200?random=event"}
                    alt={currentEvent?.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  {currentEvent?.source === 'business' && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                        ★ Établissement
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {getCategoryIcon(currentEvent?.category)} {getCategoryName(currentEvent?.category)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h2 className="text-2xl font-bold mb-1">{currentEvent?.title}</h2>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{currentEvent?.location}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">{formatDate(currentEvent?.date)}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{currentEvent?.participants} participants</span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-300">
                      <span>Proposé par {currentEvent?.organizer}</span>
                    </div>
                  </div>
                </div>
                
                {/* Card Actions */}
                <div className="flex justify-center space-x-4 py-4">
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full border-2 border-red-400 text-red-500"
                    onClick={handlePass}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full border-2 border-blue-400 text-blue-500"
                    onClick={handleSave}
                  >
                    <Star className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-14 w-14 rounded-full border-2 border-green-400 text-green-500"
                    onClick={handleLike}
                  >
                    <Heart className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </motion.div>
            
            {/* Swipe instructions */}
            <div className="absolute bottom-2 left-0 right-0 text-center text-gray-500 text-sm">
              Swipez à gauche pour passer, à droite pour aimer
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucun événement trouvé</h3>
            <p className="text-gray-500 mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
        
        {/* Card counter */}
        <div className="text-center text-gray-500 text-sm">
          {filteredEvents.length > 0 ? 
            `${currentIndex + 1} / ${filteredEvents.length}` : 
            "0 événements"
          }
        </div>
      </div>
    </AppLayout>
  );
};

export default Explore;
