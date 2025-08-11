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
  Copy
} from 'lucide-react';
import { useEventPreview } from '@/hooks/useEventPreview';
import { useSimpleEventInteractions } from '@/hooks/useSimpleEventInteractions';
import { formatEventDateTime, isToday, calculateDistance } from '@/utils/eventDetailHelpers';
import { getCategoryIcon } from '@/data/wouliCategories';
import { useToast } from '@/hooks/use-toast';
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

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: `Découvre cet événement sur Wouli : ${event.title}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback vers copie du lien
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Lien copié !",
      description: "Le lien de l'événement a été copié dans le presse-papier"
    });
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section avec Carrousel */}
      <div className="relative h-[60vh] min-h-[400px]">
        <EventImageCarousel 
          images={eventImages} 
          title={event.title}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Header buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
          <button 
            onClick={() => navigate(-1)}
            className="bg-white/20 backdrop-blur rounded-full p-2 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <button 
            onClick={handleShare}
            className="bg-white/20 backdrop-blur rounded-full p-2 hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Infos principales */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
          {/* Badge urgence */}
          {isToday(event.date) && (
            <span className="inline-flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
              <Clock className="w-4 h-4 mr-1" />
              CE SOIR
            </span>
          )}
          
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatEventDateTime(event)}
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {event.venue || event.location} • {calculateDistance()} min
            </span>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <EventSocialProof event={event} />

      {/* Indicateur de capacité */}
      {event.max_participants && event.participants >= event.max_participants * 0.7 && (
        <div className="px-6 py-3 bg-orange-50 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-sm">
              <span className="font-semibold">Plus que {event.max_participants - event.participants} places</span>
              <span className="text-gray-600 ml-1">sur {event.max_participants}</span>
            </p>
          </div>
        </div>
      )}

      {/* Description & Infos Clés */}
      <div className="px-6 py-4">
        {/* Description */}
        {event.description && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">À propos</h2>
            <p className="text-gray-700">{event.description}</p>
          </div>
        )}
        
        {/* Grille d'informations */}
        <EventInfoGrid event={event} />
      </div>

      {/* Section Lieu */}
      <EventLocationSection 
        event={event}
        onOpenMaps={openMaps}
        onCopyAddress={copyAddress}
      />

      {/* Statistiques pour événements récurrents */}
      <EventStatsRecurrent event={event} />

      {/* Bottom Bar Fixe - CTAs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50 safe-area-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          {/* Bouton Like */}
          <button 
            onClick={handleLikeClick}
            disabled={interactionsLoading}
            className={`p-3 rounded-xl border-2 transition-all ${
              isLiked 
                ? 'bg-red-50 border-red-500 text-red-500' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            } ${interactionsLoading ? 'opacity-50' : ''}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          {/* Bouton principal */}
          <button 
            onClick={handleParticipateClick}
            disabled={interactionsLoading}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              isParticipating
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            } ${interactionsLoading ? 'opacity-50' : ''}`}
          >
            {isParticipating ? (
              <>
                <CheckCircle className="w-5 h-5 inline mr-2" />
                J'y vais !
              </>
            ) : (
              <>
                Je participe
                {event.participants > 0 && ` (${event.participants})`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;