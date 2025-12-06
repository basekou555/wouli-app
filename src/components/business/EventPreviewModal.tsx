import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Clock, 
  Euro, 
  Users, 
  MapPin, 
  Navigation, 
  Copy,
  Sparkles
} from 'lucide-react';
import { getCategoryIcon, getCategoryName } from '@/data/wouliCategories';
import { formatPrice, isToday } from '@/utils/eventDetailHelpers';

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
  const venueName = eventData.custom_venue || eventData.venue || 'Lieu à confirmer';
  const address = eventData.custom_venue || eventData.venue || 'Adresse à confirmer';
  const isEventToday = eventData.date ? isToday(eventData.date) : false;

  // Générer les avatars placeholder
  const generateAvatars = () => {
    return (
      <div className="flex -space-x-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
            style={{ 
              backgroundColor: `hsl(${(i * 137.5) % 360}, 65%, 75%)`,
              color: `hsl(${(i * 137.5) % 360}, 65%, 25%)`
            }}
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>
    );
  };

  // Infos pratiques grid
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
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="h-screen p-0 border-0 bg-white overflow-hidden"
      >
        {/* Header flottant - identique à EventPreview */}
        <div className="fixed top-4 left-4 right-4 flex justify-between z-50">
          <button 
            onClick={onClose}
            className="bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button 
            className="bg-white/90 backdrop-blur rounded-full p-2 shadow-sm opacity-50 cursor-not-allowed"
            disabled
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto h-full pb-24">
          {/* Image pleine largeur ratio 4:5 */}
          <div className="w-full aspect-[4/5] bg-black">
            {eventData.image_url ? (
              <img
                src={eventData.image_url}
                alt={eventData.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                <span className="text-white/60">Ajoutez une image</span>
              </div>
            )}
          </div>

          {/* Contenu principal - identique à EventPreview */}
          <div className="px-6 py-6 space-y-6">
            {/* 1. Titre avec badge urgence */}
            <div>
              {isEventToday && (
                <span className="inline-flex items-center bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
                  <Clock className="w-4 h-4 mr-1" />
                  CE SOIR
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900">
                {eventData.title || 'Titre de l\'événement'}
              </h1>
            </div>
          </div>

          {/* 2. Social Proof Section - identique structure à EventSocialProof */}
          <div className="px-6 py-4 border-b bg-white">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-900">
                  Première édition ! Sois parmi les pionniers
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  0 personnes ont déjà regardé
                </p>
              </div>
            </div>
          </div>

          {/* Indicateur de capacité */}
          {eventData.capacity && (
            <div className="px-6 py-4">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <p className="text-sm">
                    <span className="font-semibold">Capacité : {eventData.capacity} personnes</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Description - À propos */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">À propos</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
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

          {/* 4. Infos pratiques - identique à EventInfoGrid */}
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Informations pratiques</h2>
            <div className="grid grid-cols-2 gap-4">
              {infos.map((info, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${info.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {info.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{info.label}</p>
                    <p className="text-sm text-gray-600 break-words">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Section Lieu - identique à EventLocationSection */}
          <div className="px-6 py-4 border-t bg-white">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">Lieu</h2>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{venueName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{address}, Lyon</p>
                </div>
              </div>
              
              {/* Actions lieu - mockées */}
              <div className="flex gap-2">
                <button 
                  className="flex-1 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-medium flex items-center justify-center gap-1 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Navigation className="w-4 h-4" />
                  Itinéraire
                </button>
                <button 
                  className="flex-1 bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm font-medium flex items-center justify-center gap-1 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </button>
              </div>
            </div>
          </div>

          {/* Notice preview */}
          <div className="px-6 py-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 text-center">
                ✨ Aperçu de l'événement tel qu'il apparaîtra aux utilisateurs
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar Fixe - identique à EventPreview */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50 safe-area-bottom">
          <div className="flex gap-3 max-w-lg mx-auto">
            {/* Bouton Like */}
            <button 
              className="p-3 rounded-xl border-2 bg-white border-gray-200 opacity-50 cursor-not-allowed"
              disabled
            >
              <Heart className="w-6 h-6 text-gray-400" />
            </button>
            
            {/* Bouton principal */}
            <button 
              className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white opacity-50 cursor-not-allowed"
              disabled
            >
              Je participe (0)
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventPreviewModal;
