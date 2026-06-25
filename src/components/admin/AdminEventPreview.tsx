import React, { useState } from 'react';
import { PendingEvent, ENERGY_META, isAIEnriched, aiConfidencePct } from '@/hooks/utils/adminEventMappers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, History, BarChart3, X, Calendar, MapPin, Euro, Heart, Share2, Users, ExternalLink, Check, Sparkles, Music, Mic2 } from 'lucide-react';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';
import { getCategoryById } from '@/data/wouliCategories';
import { getFocusClass, ImageFocusPosition, focusPositionLabels } from '@/utils/imageHelpers';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminEventPreviewProps {
  event: PendingEvent;
  onEdit?: (event: PendingEvent) => void;
  onHistory?: (eventId: string, eventTitle: string) => void;
  onStats?: (eventId: string) => void;
  onClose: () => void;
  onFocusChange?: (eventId: string, focus: ImageFocusPosition) => void;
}

export const AdminEventPreview: React.FC<AdminEventPreviewProps> = ({
  event,
  onEdit,
  onHistory,
  onStats,
  onClose,
  onFocusChange
}) => {
  const category = getCategoryById(event.category);
  const [selectedFocus, setSelectedFocus] = useState<ImageFocusPosition>(
    (event as any).image_focus_position || 'center'
  );
  const [isSavingFocus, setIsSavingFocus] = useState(false);

  const handleFocusChange = async (focus: ImageFocusPosition) => {
    setSelectedFocus(focus);
    setIsSavingFocus(true);
    
    try {
      const { error } = await supabase
        .from('events')
        .update({ image_focus_position: focus })
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast.success(`Focus image mis à jour: ${focusPositionLabels[focus].label}`);
      onFocusChange?.(event.id, focus);
    } catch (error) {
      console.error('Error updating focus:', error);
      toast.error('Erreur lors de la mise à jour du focus');
    } finally {
      setIsSavingFocus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: '⏳ En attente' },
      active: { variant: 'default', label: '✅ Validé' },
      rejected: { variant: 'destructive', label: '❌ Rejeté' },
      manual_review: { variant: 'warning', label: '🔶 À traiter' }
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Demain ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return null;
    return `${price}€`;
  };

  const priceDisplay = formatPrice(event.price);

  return (
    <div className="space-y-4">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Aperçu événement
          </h3>
          <p className="text-sm text-muted-foreground">
            Tel qu'il apparaîtra aux utilisateurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(event.status)}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Phone Mockup Preview */}
      <div className="flex justify-center bg-muted/30 p-6 rounded-xl">
        <div className="w-[320px] bg-background rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800">
          {/* Phone notch */}
          <div className="h-6 bg-gray-800 flex justify-center items-end pb-1">
            <div className="w-20 h-1 bg-gray-600 rounded-full" />
          </div>
          
          {/* Card Content - Exact replica of WouliEventCard swipe variant */}
          <Card className="rounded-none border-0 bg-card">
            {/* Zone Image (4:5) */}
            <div className="relative w-full aspect-[4/5]">
              <img
                src={getProxiedImageUrl(event.image_url) || "https://picsum.photos/400/500?random=event"}
                alt={event.title}
                className={cn("w-full h-full object-cover", getFocusClass(selectedFocus))}
                onError={handleImageError}
              />
              
              {/* Badge catégorie - coin supérieur droit */}
              {category && (
                <Badge className="absolute top-3 right-3 bg-purple-500/90 text-white border-none text-xs font-medium px-2 py-1 rounded-lg shadow-lg">
                  {category.icon} {category.name}
                </Badge>
              )}
              
              {/* Bouton partage - coin supérieur gauche */}
              <div className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
                <Share2 className="h-4 w-4 text-gray-700" />
              </div>
            </div>
            
            {/* Zone Informations */}
            <div className="p-4 space-y-2">
              {/* Ligne 1: Titre • Prix */}
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-lg text-foreground line-clamp-2 flex-1">
                  {event.title}
                </h3>
                {priceDisplay && (
                  <div className="flex items-center gap-1 text-purple-500 font-semibold whitespace-nowrap">
                    <Euro className="w-4 h-4" />
                    <span>{priceDisplay}</span>
                  </div>
                )}
              </div>
              
              {/* Ligne 2: Date • Lieu */}
              <div className="text-sm text-muted-foreground">
                {formatEventDate(event.date)} • {event.location}
              </div>
              
              {/* Ligne 3: Social proof */}
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-medium text-white border-2 border-white"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  12 personnes intéressées
                </span>
              </div>
            </div>
            
            {/* Zone Actions */}
            <div className="px-4 pb-4">
              <div className="flex gap-3">
                {/* Bouton × */}
                <div className="h-11 flex-1 bg-gray-100 rounded-md flex items-center justify-center">
                  <X className="h-4 w-4 text-gray-600" />
                </div>
                
                {/* Bouton Participer */}
                <div className="h-11 flex-[2] bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center text-white font-semibold text-sm">
                  Participer
                </div>
                
                {/* Bouton ♡ */}
                <div className="h-11 flex-1 bg-background border-2 border-border rounded-md flex items-center justify-center">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </Card>
          
          {/* Phone home indicator */}
          <div className="h-6 bg-background flex justify-center items-center">
            <div className="w-32 h-1 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Focus Position Selector */}
      <div className="bg-card border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Zone de focus de l'image
        </h4>
        <p className="text-xs text-muted-foreground mb-3">
          Sélectionne la zone de l'affiche à afficher en priorité dans le crop
        </p>
        <div className="flex gap-2">
          {(['top', 'center', 'bottom'] as ImageFocusPosition[]).map((focus) => (
            <button
              key={focus}
              onClick={() => handleFocusChange(focus)}
              disabled={isSavingFocus}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                selectedFocus === focus
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50 text-muted-foreground"
              )}
            >
              <span className="text-lg">{focusPositionLabels[focus].icon}</span>
              <span className="text-xs font-medium">{focusPositionLabels[focus].label}</span>
            </button>
          ))}
        </div>
        {isSavingFocus && (
          <p className="text-xs text-muted-foreground text-center mt-2">Enregistrement...</p>
        )}
      </div>

      {/* Admin Actions */}
      <div className="flex gap-3 justify-center pt-4 border-t">
        {onEdit && (
          <Button
            onClick={() => onEdit(event)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        )}
        
        {onHistory && (
          <Button
            onClick={() => onHistory(event.id, event.title)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Historique
          </Button>
        )}
        
        {onStats && event.status === 'active' && (
          <Button
            onClick={() => onStats(event.id)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Statistiques
          </Button>
        )}
      </div>

      {/* Analyse IA — ce que le pipeline extract-event a déduit */}
      {(() => {
        const enriched = isAIEnriched(event);
        const energy = event.energy ? ENERGY_META[event.energy] : null;
        const lineup = (event.lineup ?? []).filter(Boolean);
        const confidence = aiConfidencePct(event);
        if (!enriched && !energy && !event.music_style && !lineup.length && !event.subtitle) return null;
        return (
          <div className="bg-card border rounded-lg p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-foreground">Analyse IA</span>
              {confidence !== null && (
                <Badge variant="outline" className="text-xs border-green-300 text-green-700 bg-green-50">
                  Confiance {confidence}%
                </Badge>
              )}
            </div>
            {event.subtitle && (
              <p className="text-sm text-muted-foreground italic">« {event.subtitle} »</p>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              {energy && (
                <Badge variant="outline" className={`text-xs ${energy.cls}`}>{energy.label}</Badge>
              )}
              {event.music_style && (
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                  <Music className="w-3 h-3 mr-1" />{event.music_style}
                </Badge>
              )}
              {event.venue_category && (
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />{event.venue_category}
                </Badge>
              )}
            </div>
            {lineup.length > 0 && (
              <div className="flex items-start gap-2">
                <Mic2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {lineup.map((artist) => (
                    <Badge key={artist} variant="secondary" className="text-xs">{artist}</Badge>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(event.tags) && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Admin Info */}
      <div className="bg-card border rounded-lg p-4 space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div><span className="font-medium text-muted-foreground">ID:</span> <span className="font-mono text-xs">{event.id.slice(0, 8)}...</span></div>
          <div><span className="font-medium text-muted-foreground">Catégorie:</span> {category?.name || event.category}</div>
          <div><span className="font-medium text-muted-foreground">Soumis:</span> {new Date(event.created_at).toLocaleDateString('fr-FR')}</div>
          <div><span className="font-medium text-muted-foreground">Prix:</span> {priceDisplay || 'Gratuit'}</div>
        </div>
        {event.external_url && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
            <a href={event.external_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate text-xs">
              {event.external_url}
            </a>
          </div>
        )}
        {event.submitter_email && (
          <div className="pt-2 border-t">
            <span className="font-medium text-muted-foreground">Par:</span> {event.submitter_email}
          </div>
        )}
      </div>
    </div>
  );
};