
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, Heart, Share2, Euro, Users, MapPin, Calendar, Clock } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { formatEventDateTime, getPriceInfo, getLocationDisplay, getUrgencyBadge } from '@/utils/eventCardHelpers';

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
  };

  const urgencyLabel = eventData.date ? getUrgencyBadge(mockEvent.date!, mockEvent.time) : null;
  const priceInfo = getPriceInfo(mockEvent.price_text);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>Prévisualisation</DialogTitle>
          <DialogDescription>Aperçu de votre événement</DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          {/* Header bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 bg-gradient-to-b from-black/50 to-transparent">
            <span className="text-white text-sm font-medium">Aperçu utilisateur</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

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
              <Badge className="absolute top-14 right-3 bg-red-500 text-white border-none animate-pulse text-xs font-medium px-2 py-1 rounded-lg shadow-lg">
                {urgencyLabel}
              </Badge>
            )}
            
            {/* Share button mock */}
            <Button 
              size="sm"
              className="absolute top-14 left-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full p-0 border-0"
              disabled
            >
              <Share2 className="h-4 w-4 text-gray-700" />
            </Button>
          </div>

          {/* Info section */}
          <div className="p-4 space-y-2">
            {/* Title & Price */}
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-lg text-foreground line-clamp-2 flex-1">
                {mockEvent.title}
              </h3>
              {!priceInfo.isFree && (
                <div className="flex items-center gap-1 text-purple-500 font-semibold whitespace-nowrap">
                  <Euro className="w-4 h-4" />
                  <span>{priceInfo.display}</span>
                </div>
              )}
            </div>
            
            {/* Date & Location */}
            <div className="text-sm text-muted-foreground">
              {eventData.date && eventData.time 
                ? formatEventDateTime(mockEvent.date!, mockEvent.time)
                : 'Date à définir'
              } • {getLocationDisplay(mockEvent.venue, mockEvent.location)}
            </div>
            
            {/* Social proof mock */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                Sois le premier à participer
              </span>
            </div>

            {/* Capacity info */}
            {eventData.capacity && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>Capacité: {eventData.capacity} personnes</span>
              </div>
            )}
          </div>

          {/* Actions section mock */}
          <div className="px-4 pb-4">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="h-11 flex-1 bg-gray-100 border-gray-200"
                disabled
              >
                <X className="h-4 w-4" />
              </Button>
              
              <Button 
                className="h-11 font-semibold flex-[2] bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                disabled
              >
                Participer
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="h-11 flex-1 border-2 border-border"
                disabled
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Preview notice */}
          <div className="px-4 pb-4">
            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-amber-600 text-center">
                ✨ Ceci est un aperçu de comment les utilisateurs verront votre événement
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventPreviewModal;
