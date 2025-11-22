import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { WOULI_CATEGORIES as categories } from '../data/wouliCategories';
import { useAllEvents } from '@/hooks/useAllEvents';
import TinderCard from 'react-tinder-card';

import { PageSkeleton } from '@/components/LoadingSkeleton';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ChevronDown, Check, X } from "lucide-react";

const UserAppGridTest = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<string[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentCardRef = useRef<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    events: allEvents,
    loading,
    likeEvent: handleLikeEvent,
    participateEvent: handleParticipateEvent,
  } = useAllEvents();

  const filteredEvents = selectedCategory === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.category === selectedCategory);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentIndex(0);
  };

  const handleLike = async (eventId: string) => {
    if (!likedEvents.includes(eventId)) {
      setLikedEvents([...likedEvents, eventId]);
      await handleLikeEvent(eventId);
    }
    nextCard();
  };

  const handleParticipate = async (eventId: string) => {
    if (!participatingEvents.includes(eventId)) {
      setParticipatingEvents([...participatingEvents, eventId]);
      await handleParticipateEvent(eventId);
    }
    nextCard();
  };

  const handleDislike = () => {
    nextCard();
  };

  const handleCardClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const nextCard = () => {
    if (currentIndex < filteredEvents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast({
        title: "C'est tout !",
        description: "Plus d'événements à découvrir pour le moment"
      });
      setCurrentIndex(0);
    }
  };

  // Fermer le menu au clic extérieur
  React.useEffect(() => {
    const handleClickOutside = () => setIsMenuOpen(false);
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="bg-background">
      {/* Header Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo + Badge */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Wouli</span>
            <Badge variant="destructive" className="text-xs">TEST</Badge>
          </div>

          {/* Bouton Filtres */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
          >
            <span>{categories.find(c => c.id === selectedCategory)?.icon || '🎯'}</span>
            <span>{categories.find(c => c.id === selectedCategory)?.name || 'Filtres'}</span>
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-9 h-9 rounded-full bg-card shadow flex items-center justify-center hover:bg-accent transition-all"
              aria-label="Menu"
            >
              <span className="text-lg">☰</span>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-12 right-0 w-48 bg-card rounded-lg shadow-xl border border-border overflow-hidden">
                <button onClick={() => { navigate('/search'); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 text-left hover:bg-accent text-sm transition-colors">
                  🔍 Rechercher
                </button>
                <button onClick={() => { navigate('/explore'); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 text-left hover:bg-accent text-sm transition-colors">
                  🗺️ Explorer
                </button>
                <button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 text-left hover:bg-accent text-sm transition-colors">
                  👤 Profil
                </button>
                <div className="border-t border-border" />
                <button onClick={() => { navigate('/app'); setIsMenuOpen(false); }} className="w-full px-4 py-2.5 text-left hover:bg-accent text-sm text-primary transition-colors">
                  ← Version stable
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Container Scrollable - Padding top pour header fixed */}
      <div className="pt-14">
        {filteredEvents.length > 0 ? (
          <>
            {/* Carte Active */}
            {currentIndex < filteredEvents.length && (
              <div className="relative">
                {/* TinderCard wrap tout */}
                <TinderCard
                  ref={currentCardRef}
                  key={filteredEvents[currentIndex].id}
                  onSwipe={(direction) => {
                    if (direction === 'left') handleDislike();
                    if (direction === 'right') handleLike(filteredEvents[currentIndex].id);
                  }}
                  preventSwipe={['up', 'down']}
                  swipeRequirementType="position"
                  swipeThreshold={100}
                >
                  {/* Container scrollable vertical */}
                  <div className="h-screen overflow-y-auto snap-y snap-mandatory">
                    {/* Section Image (snap point) */}
                    <div className="snap-start relative" style={{ height: '85vh' }}>
                      {/* Image plein écran */}
                      <img
                        src={filteredEvents[currentIndex].image_url}
                        alt={filteredEvents[currentIndex].title}
                        className="w-full h-full object-cover"
                      />

                      {/* Gradient overlay pour lisibilité */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Titre sur l'image */}
                      <div className="absolute bottom-20 left-0 right-0 px-6">
                        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                          {filteredEvents[currentIndex].title}
                        </h2>
                        <p className="text-white/90 text-sm drop-shadow">
                          📍 {filteredEvents[currentIndex].location}
                        </p>
                      </div>

                      {/* Boutons Flottants */}
                      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-20">
                        {/* Dislike */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDislike(); }}
                          className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-transform"
                        >
                          <X className="h-7 w-7" />
                        </button>

                        {/* Like */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLike(filteredEvents[currentIndex].id); }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>

                        {/* Participer */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleParticipate(filteredEvents[currentIndex].id); }}
                          className="w-14 h-14 rounded-full bg-white shadow-xl flex items-center justify-center text-green-500 hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Check className="h-7 w-7" />
                        </button>
                      </div>
                    </div>

                    {/* Section Détails (scrollable) */}
                    <div className="snap-start bg-background min-h-screen p-6">
                      {/* Date & Heure */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>📅</span>
                          <span>{new Date(filteredEvents[currentIndex].date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {filteredEvents[currentIndex].time && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>🕐</span>
                            <span>{filteredEvents[currentIndex].time}</span>
                          </div>
                        )}
                      </div>

                      {/* Prix */}
                      {('price' in filteredEvents[currentIndex] && filteredEvents[currentIndex].price !== null && filteredEvents[currentIndex].price !== undefined) && (
                        <div className="flex items-center gap-2 mb-6">
                          <span>💰</span>
                          <span className="font-semibold">
                            {(filteredEvents[currentIndex] as any).price === 0 
                              ? 'Gratuit' 
                              : `${(filteredEvents[currentIndex] as any).price}€`}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      {filteredEvents[currentIndex].description && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Description</h3>
                          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                            {filteredEvents[currentIndex].description}
                          </p>
                        </div>
                      )}

                      {/* Adresse */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Lieu</h3>
                        <p className="text-muted-foreground">
                          📍 {filteredEvents[currentIndex].address || filteredEvents[currentIndex].location}
                        </p>
                      </div>

                      {/* Participants */}
                      {filteredEvents[currentIndex].participants > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">Participants</h3>
                          <p className="text-muted-foreground">
                            👥 {filteredEvents[currentIndex].participants} personne{filteredEvents[currentIndex].participants > 1 ? 's' : ''} intéressée{filteredEvents[currentIndex].participants > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}

                      {/* Bouton Voir Plus */}
                      <button
                        onClick={() => navigate(`/events/${filteredEvents[currentIndex].id}`)}
                        className="w-full py-3 mt-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                      >
                        Voir tous les détails →
                      </button>

                      {/* Espace bottom pour scroll confortable */}
                      <div className="h-20" />
                    </div>
                  </div>
                </TinderCard>
              </div>
            )}
          </>
        ) : (
          <div className="h-screen flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                Aucun événement disponible
              </p>
              <Button
                variant="outline"
                onClick={() => handleCategoryChange('all')}
              >
                Voir tous les événements
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Filtres */}
      <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Catégories</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategoryChange(category.id);
                  setIsFilterDrawerOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                  ${selectedCategory === category.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary hover:bg-secondary/80'
                  }
                `}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                {selectedCategory === category.id && (
                  <Check className="w-5 h-5 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default UserAppGridTest;
