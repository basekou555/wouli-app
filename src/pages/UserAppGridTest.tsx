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
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo + Badge */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">Wouli</span>
            <Badge variant="destructive" className="text-xs">TEST</Badge>
          </div>

          {/* Bouton Filtres */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <span className="text-base">{categories.find(c => c.id === selectedCategory)?.icon || '🎯'}</span>
            <span>{categories.find(c => c.id === selectedCategory)?.name || 'Filtres'}</span>
          </button>

          {/* Menu Amélioré */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-accent hover:shadow-lg transition-all border border-border"
              aria-label="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute top-12 right-0 w-52 bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
                <button 
                  onClick={() => { navigate('/search'); setIsMenuOpen(false); }} 
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">🔍</span>
                  <span className="text-sm font-medium">Rechercher</span>
                </button>
                <button 
                  onClick={() => { navigate('/explore'); setIsMenuOpen(false); }} 
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">🗺️</span>
                  <span className="text-sm font-medium">Explorer</span>
                </button>
                <button 
                  onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} 
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">👤</span>
                  <span className="text-sm font-medium">Profil</span>
                </button>
                <div className="border-t border-border" />
                <button 
                  onClick={() => { navigate('/app'); setIsMenuOpen(false); }} 
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">←</span>
                  <span className="text-sm font-medium text-primary">Version stable</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Container Principal - Padding pour header fixed */}
      <div className="pt-16">
        {filteredEvents.length > 0 ? (
          <>
            {currentIndex < filteredEvents.length && (
              <div className="relative">
                {/* Section Scrollable : Infos + Image + Détails */}
                <div className="h-screen overflow-y-auto">
                  
                  {/* Infos au-dessus de l'image - Style Happn */}
                  <div className="bg-background px-6 pt-4 pb-3">
                    <h1 className="text-2xl font-bold mb-2">
                      {filteredEvents[currentIndex].title}
                    </h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span>📍</span>
                      <span className="font-medium">{filteredEvents[currentIndex].location}</span>
                    </div>
                  </div>

                  {/* Image Swipable */}
                  <div className="relative">
                    <TinderCard
                      ref={currentCardRef}
                      key={filteredEvents[currentIndex].id}
                      onSwipe={(direction) => {
                        if (direction === 'left') handleDislike();
                        if (direction === 'right') handleLike(filteredEvents[currentIndex].id);
                      }}
                      preventSwipe={['up', 'down']}
                      swipeRequirementType="velocity"
                      swipeThreshold={150}
                    >
                      <div className="relative" style={{ height: '65vh' }}>
                        <img
                          src={filteredEvents[currentIndex].image_url}
                          alt={filteredEvents[currentIndex].title}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient subtil en bas pour transition douce */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
                      </div>
                    </TinderCard>
                  </div>

                  {/* Section Détails */}
                  <div className="bg-background px-6 pb-32">
                    {/* Date & Heure */}
                    <div className="flex items-center gap-4 mb-6 pt-6">
                      <div className="flex items-center gap-2 text-sm">
                        <span>📅</span>
                        <span className="font-medium">
                          {new Date(filteredEvents[currentIndex].date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </span>
                      </div>
                      {filteredEvents[currentIndex].time && (
                        <div className="flex items-center gap-2 text-sm">
                          <span>🕐</span>
                          <span className="font-medium">{filteredEvents[currentIndex].time}</span>
                        </div>
                      )}
                    </div>

                    {/* Prix */}
                    {('price' in filteredEvents[currentIndex] && 
                      filteredEvents[currentIndex].price !== null && 
                      filteredEvents[currentIndex].price !== undefined) && (
                      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-accent rounded-lg">
                        <span className="text-xl">💰</span>
                        <span className="font-semibold text-lg">
                          {(filteredEvents[currentIndex] as any).price === 0 
                            ? 'Gratuit' 
                            : `${(filteredEvents[currentIndex] as any).price}€`}
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {filteredEvents[currentIndex].description && (
                      <div className="mb-6">
                        <h3 className="text-base font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                          À propos
                        </h3>
                        <p className="text-foreground leading-relaxed">
                          {filteredEvents[currentIndex].description}
                        </p>
                      </div>
                    )}

                    {/* Adresse */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                        Adresse
                      </h3>
                      <p className="text-foreground flex items-start gap-2">
                        <span className="text-lg">📍</span>
                        <span>{filteredEvents[currentIndex].address || filteredEvents[currentIndex].location}</span>
                      </p>
                    </div>

                    {/* Participants */}
                    {filteredEvents[currentIndex].participants > 0 && (
                      <div className="mb-6">
                        <h3 className="text-base font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                          Participants
                        </h3>
                        <div className="flex items-center gap-2 text-foreground">
                          <span className="text-lg">👥</span>
                          <span>
                            {filteredEvents[currentIndex].participants} personne{filteredEvents[currentIndex].participants > 1 ? 's' : ''} intéressée{filteredEvents[currentIndex].participants > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Bouton Voir Plus */}
                    <button
                      onClick={() => navigate(`/events/${filteredEvents[currentIndex].id}`)}
                      className="w-full py-3.5 mt-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold shadow-lg hover:shadow-xl"
                    >
                      Voir tous les détails →
                    </button>
                  </div>
                </div>

                {/* Boutons d'Action FIXED - Toujours visibles */}
                <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center gap-4 z-50 px-4">
                  {/* Dislike */}
                  <button
                    onClick={handleDislike}
                    className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-red-500 hover:scale-110 active:scale-95 transition-all border-2 border-red-100"
                    aria-label="Passer"
                  >
                    <X className="h-8 w-8 stroke-[2.5]" />
                  </button>

                  {/* Participer - AU CENTRE */}
                  <button
                    onClick={() => handleParticipate(filteredEvents[currentIndex].id)}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
                    aria-label="Participer"
                  >
                    <Check className="h-10 w-10 stroke-[3]" />
                  </button>

                  {/* Like */}
                  <button
                    onClick={() => handleLike(filteredEvents[currentIndex].id)}
                    className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center text-pink-500 hover:scale-110 active:scale-95 transition-all border-2 border-pink-100"
                    aria-label="J'aime"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>

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
