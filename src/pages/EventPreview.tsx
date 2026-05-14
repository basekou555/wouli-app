import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Clock,
  Calendar,
  MapPin,
  Heart,
  CheckCircle,
  Users,
  Sparkles,
  AlertCircle,
  Euro,
  Timer,
  Navigation,
  Copy,
  MessageCircle
} from 'lucide-react';
import { useEventPreview } from '@/hooks/useEventPreview';
import { useSimpleEventInteractions } from '@/hooks/useSimpleEventInteractions';
import { formatEventDateTime, isToday, calculateDistance } from '@/utils/eventDetailHelpers';
import { getCategoryIcon } from '@/data/wouliCategories';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import EventImageCarousel from '@/components/event-preview/EventImageCarousel';
import EventSocialProof from '@/components/event-preview/EventSocialProof';
import EventInfoGrid from '@/components/event-preview/EventInfoGrid';
import EventLocationSection from '@/components/event-preview/EventLocationSection';
import EventStatsRecurrent from '@/components/event-preview/EventStatsRecurrent';

const EventPreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { event, loading, error } = useEventPreview(id);
  const { handleLike, handleParticipate, handleIncrementViews, getInteractionStatus } = useSimpleEventInteractions();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [interactionsLoading, setInteractionsLoading] = useState(true);

  // Charger les interactions utilisateur
  useEffect(() => {
    if (event?.id && !interactionsLoading) return;
    
    const loadInteractions = async () => {
      if (!event?.id) return;
      
      const status = await getInteractionStatus(event.id);
      setIsLiked(status.hasLiked);
      setIsParticipating(status.hasParticipated);
      setInteractionsLoading(false);
      
      // Incrémenter les vues
      await handleIncrementViews(event.id);
    };
    
    loadInteractions();
  }, [event?.id]);

  const handleLikeClick = async () => {
    if (!event) return;
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
    
    await handleLike(event.id, event.title);
  };

  const handleParticipateClick = async () => {
    if (!event) return;
    
    const newParticipatingState = !isParticipating;
    setIsParticipating(newParticipatingState);
    
    if (newParticipatingState) {
      toast({
        title: "Super ! 🎉",
        description: "Tu es inscrit à cet événement"
      });
    }
    
    await handleParticipate(event.id, event.title);
  };

  const getShareUrl = () => {
    const base = `${window.location.origin}/e/${event?.id}`;
    return profile?.username ? `${base}?ref=${profile.username}` : base;
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: `Découvre cet événement sur Wouli : ${event.title}`,
          url: getShareUrl(),
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast({
      title: "Lien copié !",
      description: "Le lien de l'événement a été copié dans le presse-papier"
    });
  };

  const handleWhatsApp = () => {
    if (!event) return;
    const text = encodeURIComponent(`On y va ? ${event.title} 🎉\n${getShareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const openMaps = (location: string) => {
    const query = encodeURIComponent(location);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

  const copyAddress = (location: string) => {
    navigator.clipboard.writeText(location);
    toast({
      title: "Adresse copiée !",
      description: "L'adresse a été copiée dans le presse-papier"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Événement non trouvé</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const eventImages = [
    event.image_url
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header buttons fixe */}
      <div className="fixed top-4 left-4 right-4 flex justify-between z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-card/90 backdrop-blur rounded-full p-2 hover:bg-card transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handleShare}
          className="bg-card/90 backdrop-blur rounded-full p-2 hover:bg-card transition-colors shadow-sm"
        >
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Image pleine largeur ratio 4:5 */}
      <div className="w-full aspect-[4/5] bg-black">
        <EventImageCarousel
          images={eventImages}
          title={event.title}
          isFullWidth={true}
        />
      </div>

      {/* Contenu principal */}
      <div className="px-6 py-6 space-y-6">
        {/* 1. Titre avec badge urgence */}
        <div>
          {isToday(event.date) && (
            <span className="inline-flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
              <Clock className="w-4 h-4 mr-1" />
              CE SOIR
            </span>
          )}
          <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
        </div>

        {/* 2. Social Proof Section */}
        <EventSocialProof event={event} />

        {/* Indicateur de capacité */}
        {event.max_participants && event.participants >= event.max_participants * 0.7 && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <p className="text-sm">
                <span className="font-semibold text-foreground">
                  Plus que {event.max_participants - event.participants} places
                </span>
                <span className="text-muted-foreground ml-1">sur {event.max_participants}</span>
              </p>
            </div>
          </div>
        )}

        {/* 3. Description */}
        {event.description && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">À propos</h2>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* 4. Infos pratiques */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Informations pratiques</h2>
          <EventInfoGrid event={event} />
        </div>
      </div>

      {/* 5. Section Lieu détaillée */}
      <EventLocationSection
        event={event}
        onOpenMaps={openMaps}
        onCopyAddress={copyAddress}
      />

      {/* Statistiques pour événements récurrents */}
      <EventStatsRecurrent event={event} />

      {/* Bottom Bar Fixe - CTAs */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-50"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-3 max-w-lg mx-auto">
          {/* Bouton Like */}
          <button
            onClick={handleLikeClick}
            disabled={interactionsLoading}
            className={`p-3 rounded-xl border-2 transition-all ${
              isLiked
                ? 'bg-red-50 border-red-500 text-red-500'
                : 'bg-background border-border hover:border-muted-foreground'
            } ${interactionsLoading ? 'opacity-50' : ''}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Bouton WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="p-3 rounded-xl border-2 border-green-400 text-green-600 hover:bg-green-50 transition-all"
            title="Organiser avec des amis"
          >
            <MessageCircle className="w-6 h-6" />
          </button>


          {/* Bouton principal */}
          <button
            onClick={handleParticipateClick}
            disabled={interactionsLoading}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              isParticipating
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white'
            } ${interactionsLoading ? 'opacity-50' : ''}`}
          >
            {isParticipating ? (
              <><CheckCircle className="w-5 h-5 inline mr-2" />J'y vais !</>
            ) : (
              <>Je participe{event.participants > 0 && ` (${event.participants})`}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;