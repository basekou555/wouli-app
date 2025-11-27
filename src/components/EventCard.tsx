import React, { useState, useEffect, useRef } from 'react';
import { UnifiedEvent } from '@/types/unified';
import { X, Heart, Share2, Check, Menu, Search, Filter } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { getSocialProofText, getPriceInfo } from '@/utils/eventCardHelpers';

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

// Helper : URL image statique OpenStreetMap
const getStaticMapUrl = (lat: number, lon: number) => {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=15&size=600x300&markers=${lat},${lon},red-pushpin`;
};

// Coordonnées Lyon par défaut
const getLyonCoordinates = () => ({ lat: 45.7640, lon: 4.8357 });

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
  onFilterClick,
  onEstablishmentClick,
  onMapClick
}) => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper : Format date court français (ex: "Sam 23 nov")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Helper : Format heure (ex: "19h00")
  const formatTime = (dateString: string, time?: string) => {
    if (time) return time;
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

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
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-full">
          {/* Gauche : Menu (toujours visible) */}
          <button
            onClick={onMenuClick}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

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
      <div className="pt-14">
        {/* Titre + Lieu - Scrollable, juste sous header */}
        <div className="px-4 py-5 bg-card border-b border-border">
          <h1 className="text-xl font-bold mb-2 text-foreground line-clamp-3 text-left">
            {event.title}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span>📍</span>
            <span>{event.location}</span>
          </p>
        </div>

        {/* Image Immersive - 70vh */}
        <div className="relative w-full" style={{ height: '65vh' }}>
          <img
            src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/600?random=event"}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
          />
          
          {/* Bouton Retour en Overlay (visible si pas premier event) */}
          {!isFirstEvent && (
            <button
              onClick={onBack}
              className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all z-10"
              aria-label="Retour"
            >
              <span className="text-xl">←</span>
            </button>
          )}
          
          {/* Gradient overlay subtil pour transition */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* ========== SECTION 1 : Date/Heure/Lieu/Distance ========== */}
        <div className="px-4 py-6 bg-card border-b border-border">
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <span className="text-sm font-medium">{formatDate(event.date)}</span>
            </div>
            
            {/* Heure */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              <span className="text-sm font-medium">{formatTime(event.date, event.time)}</span>
            </div>
            
            {/* Lieu */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <span className="text-sm font-medium truncate">{event.venue || event.location}</span>
            </div>
            
            {/* Distance */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚶</span>
              {/* TODO: Implémenter géolocalisation + calcul distance */}
              <span className="text-sm text-muted-foreground">À calculer</span>
            </div>
          </div>
        </div>

        {/* ========== SECTION 2 : Prix ========== */}
        {event.price_text && (
          <div className="px-4 py-3 bg-card border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-sm font-semibold text-primary">
                {getPriceInfo(event.price_text).display}
              </span>
            </div>
          </div>
        )}

        {/* ========== SECTION 3 : Participants ========== */}
        <div className="px-4 py-6 bg-card border-b border-border">
          {/* Avatars Amis */}
          {event.friendsParticipating && event.friendsParticipating.length > 0 && (
            <div className="flex -space-x-2 mb-3">
              {event.friendsParticipating.slice(0, 3).map((friend) => (
                friend.avatar ? (
                  <img
                    key={friend.id}
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-10 h-10 rounded-full border-2 border-card object-cover"
                  />
                ) : (
                  <div
                    key={friend.id}
                    className="w-10 h-10 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-sm font-medium text-primary"
                  >
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                )
              ))}
            </div>
          )}
          
          {/* Compteur */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <span className="text-sm font-medium">
              {getSocialProofText(event.friendsParticipating || [], event.totalParticipants || 0)}
            </span>
          </div>
        </div>

        {/* ========== SECTION 4 : Description ========== */}
        <div className="px-4 py-6 bg-card border-b border-border">
          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-2">
            {event.tags && event.tags.length > 0 ? (
              event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="inline-block px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                🔑 Tags à venir
              </span>
            )}
          </div>
          
          {/* Titre */}
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            📝 <span>Description</span>
          </h3>
          
          {/* Texte */}
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {event.description || "Aucune description disponible"}
          </p>
        </div>

        {/* ========== SECTION 5 : Établissement ========== */}
        <div className="px-4 py-6 bg-card border-b border-border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            🏢 <span>Organisateur</span>
          </h3>
          
          <button
            onClick={onEstablishmentClick}
            className="w-full flex items-center gap-4 p-4 bg-background rounded-lg hover:bg-accent transition-colors"
          >
            {/* Logo établissement */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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

        {/* ========== SECTION 6 : Map ========== */}
        <div className="px-4 py-6 bg-card pb-40">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            📍 <span>Localisation</span>
          </h3>
          
          {/* Map Container */}
          <button
            onClick={onMapClick}
            className="w-full h-[300px] rounded-lg overflow-hidden bg-muted relative group"
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
