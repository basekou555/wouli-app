
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Heart, Share2, Euro, Users, MapPin, Calendar, Clock, Navigation, Copy, Eye, Timer } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { formatEventDateTime, getPriceInfo, getLocationDisplay, getUrgencyBadge } from '@/utils/eventCardHelpers';
import { getCategoryIcon, getCategoryName } from '@/data/wouliCategories';
import { formatPrice } from '@/utils/eventDetailHelpers';

interface EventPreviewModalProps {
  open: boolean;
  onClose: () => void;
  eventData: {
    title: string;
    date: string;
    time: string;
    description: string;
    image_url: string;
    price: string;
    venue: string;
    custom_venue?: string;
    venue_category?: string;
    activity_type?: string;
    capacity?: string;
    end_date?: string;
    end_time?: string;
    event_format?: string;
    ambiance?: string;
    target_audience?: string[];
  };
}

const EventPreviewModal: React.FC<EventPreviewModalProps> = ({ open, onClose, eventData }) => {
  const mockEvent: Partial<UnifiedEvent> = {
    id: 'preview',
    title: eventData.title || 'Titre de l\'événement',
    date: eventData.date ? `${eventData.date}T${eventData.time || '20:00'}` : new Date().toISOString(),
    time: eventData.time || '20:00',
    description: eventData.description || 'Description de votre événement...',
    image_url: eventData.image_url,
    price_text: eventData.price || 'Gratuit',
    venue: eventData.custom_venue || eventData.venue || 'Votre établissement',
    location: eventData.custom_venue || eventData.venue || 'Lyon',
    participants: 0,
    likes: 0,
    views: 0,
    category: eventData.venue_category as any,
    event_type: eventData.activity_type as any,
  };

  const urgencyLabel = eventData.date ? getUrgencyBadge(mockEvent.date!, mockEvent.time) : null;
  const priceInfo = getPriceInfo(mockEvent.price_text);
  const venueName = eventData.custom_venue || eventData.venue || 'Lieu à confirmer';

  // Générer les avatars mockés
  const generateMockAvatars = () => (
    <div className="flex -space-x-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-card flex items-center justify-center"
        >
          <span className="text-[10px] text-white font-medium">?</span>
        </div>
      ))}
    </div>
  );

  // Infos pratiques
  const infos = [
    {
      icon: <Euro className="w-5 h-5 text-purple-600" />,
      bgColor: 'bg-purple-100',
      label: 'Prix',
      value: formatPrice(eventData.price)
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-600" />,
      bgColor: 'bg-blue-100',
      label: 'Horaires',
      value: eventData.time || 'À confirmer'
    },
    {
      icon: <span className="text-lg">{getCategoryIcon(eventData.activity_type || eventData.venue_category)}</span>,
      bgColor: 'bg-green-100',
      label: 'Type',
      value: getCategoryName(eventData.activity_type || eventData.venue_category) || 'Non défini'
    }
  ];

  // Ajouter capacité si disponible
  if (eventData.capacity) {
    infos.push({
      icon: <Users className="w-5 h-5 text-orange-600" />,
      bgColor: 'bg-orange-100',
      label: 'Capacité',
      value: `${eventData.capacity} pers.`
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card max-h-[90vh] flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Prévisualisation</DialogTitle>
          <DialogDescription>Aperçu de votre événement</DialogDescription>
        </DialogHeader>
        
        {/* Header fixe */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <span className="font-semibold text-foreground">Aperçu utilisateur</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Contenu scrollable */}
        <ScrollArea className="flex-1">
          <div className="pb-24">
            {/* Image section */}
            <div className="relative aspect-[4/5] bg-muted">
              {eventData.image_url ? (
                <img
                  src={eventData.image_url}
                  alt={mockEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <span className="text-muted-foreground">Ajoutez une image</span>
                </div>
              )}
              
              {/* Urgency badge */}
              {urgencyLabel && (
                <Badge className="absolute top-4 right-4 bg-red-500 text-white border-none animate-pulse text-xs font-medium px-2 py-1 rounded-lg shadow-lg">
                  {urgencyLabel}
                </Badge>
              )}
              
              {/* Share button mock */}
              <Button 
                size="sm"
                className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full p-0 border-0"
                disabled
              >
                <Share2 className="h-4 w-4 text-gray-700" />
              </Button>
            </div>

            {/* Titre */}
            <div className="px-5 pt-5">
              <h1 className="text-xl font-bold text-foreground">
                {mockEvent.title}
              </h1>
            </div>

            {/* Social proof section */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  {generateMockAvatars()}
                  <span className="text-sm text-muted-foreground">
                    Sois le premier à participer !
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> 0
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> 0
                  </span>
                </div>
              </div>
            </div>

            {/* Capacité warning si presque plein (mock) */}
            {eventData.capacity && (
              <div className="px-5 pb-3">
                <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-700">
                    Capacité : {eventData.capacity} personnes
                  </span>
                </div>
              </div>
            )}

            {/* Description - À propos */}
            <div className="px-5 py-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-3">À propos</h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {eventData.description || 'Aucune description pour le moment...'}
              </p>
              
              {/* Tags ambiance / audience */}
              {(eventData.ambiance || (eventData.target_audience && eventData.target_audience.length > 0)) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {eventData.ambiance && (
                    <Badge variant="secondary" className="text-xs">
                      {eventData.ambiance}
                    </Badge>
                  )}
                  {eventData.target_audience?.slice(0, 3).map((audience, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Informations pratiques */}
            <div className="px-5 py-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Informations pratiques</h2>
              <div className="grid grid-cols-2 gap-4">
                {infos.map((info, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${info.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {info.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm">{info.label}</p>
                      <p className="text-sm text-muted-foreground break-words">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Lieu */}
            <div className="px-5 py-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground mb-3">Lieu</h2>
              
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-medium text-foreground">{venueName}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-6">
                      {eventData.custom_venue || eventData.venue || 'Adresse à confirmer'}, Lyon
                    </p>
                  </div>
                </div>
                
                {/* Actions lieu - mockées */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    disabled
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    Itinéraire
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                    disabled
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copier
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview notice */}
            <div className="px-5 py-4">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs text-amber-600 text-center">
                  ✨ Ceci est un aperçu de comment les utilisateurs verront votre événement
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer fixe avec actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4">
          <div className="flex gap-3 items-center">
            <Button 
              variant="outline" 
              size="lg"
              className="h-12 w-12 p-0 border-2"
              disabled
            >
              <Heart className="h-5 w-5" />
            </Button>
            
            <Button 
              className="h-12 font-semibold flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              disabled
            >
              <Users className="w-4 h-4 mr-2" />
              Participer (0)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventPreviewModal;
