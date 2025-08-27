import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Check, X, ArrowRight, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  location: string;
  date: string;
}

interface EnhancedContent {
  title: string;
  description: string;
  time?: string;
}

interface EnhanceWithAIModalProps {
  events: PendingEvent[];
  onClose: () => void;
  onSuccess: () => void;
}

const EnhanceWithAIModal = ({ events, onClose, onSuccess }: EnhanceWithAIModalProps) => {
  const [enhancing, setEnhancing] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [enhancements, setEnhancements] = useState<Record<string, EnhancedContent>>({});
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();

  const currentEvent = events[currentEventIndex];
  const currentEnhancement = enhancements[currentEvent?.id];

  const enhanceEvent = async (event: PendingEvent) => {
    try {
      console.log('Enhancing event:', event.title);
      
      const { data, error } = await supabase.functions.invoke('enhance-event-content', {
        body: {
          title: event.title,
          description: event.description || '',
          location: event.location
        }
      });

      if (error) {
        console.error('Error calling enhance function:', error);
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as EnhancedContent;
    } catch (error) {
      console.error('Error enhancing event:', error);
      throw error;
    }
  };

  const handleEnhanceAll = async () => {
    setEnhancing(true);
    const newEnhancements: Record<string, EnhancedContent> = {};

    try {
      for (let i = 0; i < events.length; i++) {
        setCurrentEventIndex(i);
        const event = events[i];
        
        try {
          const enhanced = await enhanceEvent(event);
          newEnhancements[event.id] = enhanced;
        } catch (error) {
          console.error(`Error enhancing event ${event.title}:`, error);
          // Garder le contenu original en cas d'erreur
          newEnhancements[event.id] = {
            title: event.title,
            description: event.description || '',
          };
        }
        
        // Petite pause entre les appels
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setEnhancements(newEnhancements);
      setCurrentEventIndex(0);
      
      toast({
        title: "✨ Amélioration terminée",
        description: `${events.length} événement(s) amélioré(s) par l'IA`
      });
    } catch (error) {
      console.error('Error in enhancement process:', error);
      toast({
        title: "Erreur d'amélioration",
        description: "Une erreur est survenue pendant l'amélioration",
        variant: "destructive"
      });
    } finally {
      setEnhancing(false);
    }
  };

  const handleApplyChanges = async () => {
    setApplying(true);
    let successCount = 0;

    try {
      for (const event of events) {
        const enhancement = enhancements[event.id];
        if (!enhancement) continue;

        // Appliquer l'heure si elle a été extraite
        let newDate = event.date;
        if (enhancement.time) {
          const eventDate = new Date(event.date);
          const [hours, minutes] = enhancement.time.split(':');
          eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          newDate = eventDate.toISOString();
        }

        const { error } = await supabase
          .from('events')
          .update({
            title: enhancement.title,
            description: enhancement.description || null,
            date: newDate,
            updated_at: new Date().toISOString()
          })
          .eq('id', event.id);

        if (error) {
          console.error(`Error updating event ${event.id}:`, error);
        } else {
          successCount++;
        }
      }

      toast({
        title: "✅ Modifications appliquées",
        description: `${successCount}/${events.length} événement(s) mis à jour`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error applying changes:', error);
      toast({
        title: "Erreur d'application",
        description: "Impossible d'appliquer toutes les modifications",
        variant: "destructive"
      });
    } finally {
      setApplying(false);
    }
  };

  const hasEnhancements = Object.keys(enhancements).length > 0;

  return (
    <Dialog open={events.length > 0} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Amélioration IA - {events.length} événement(s)
          </DialogTitle>
        </DialogHeader>

        {!hasEnhancements ? (
          // Phase d'amélioration
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                {enhancing ? (
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                ) : (
                  <Sparkles className="w-8 h-8 text-purple-600" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">
                  {enhancing ? 'Amélioration en cours...' : 'Prêt à améliorer'}
                </h3>
                <p className="text-muted-foreground">
                  {enhancing 
                    ? `Traitement ${currentEventIndex + 1}/${events.length} : ${currentEvent?.title}`
                    : `L'IA va améliorer les titres et descriptions de ${events.length} événement(s)`
                  }
                </p>
              </div>

              {enhancing && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentEventIndex + 1) / events.length) * 100}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={onClose} variant="outline" disabled={enhancing}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleEnhanceAll} disabled={enhancing}>
                <Sparkles className="w-4 h-4 mr-2" />
                {enhancing ? 'Amélioration...' : 'Commencer l\'amélioration'}
              </Button>
            </div>
          </div>
        ) : (
          // Phase de prévisualisation
          <div className="space-y-6">
            {/* Navigation des événements */}
            {events.length > 1 && (
              <div className="flex items-center gap-2 justify-center">
                <Button 
                  onClick={() => setCurrentEventIndex(Math.max(0, currentEventIndex - 1))}
                  disabled={currentEventIndex === 0}
                  size="sm"
                  variant="outline"
                >
                  ← Précédent
                </Button>
                <Badge variant="secondary">
                  {currentEventIndex + 1} / {events.length}
                </Badge>
                <Button 
                  onClick={() => setCurrentEventIndex(Math.min(events.length - 1, currentEventIndex + 1))}
                  disabled={currentEventIndex === events.length - 1}
                  size="sm"
                  variant="outline"
                >
                  Suivant →
                </Button>
              </div>
            )}

            {/* Comparaison avant/après */}
            <div className="grid grid-cols-2 gap-4">
              {/* Avant */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Avant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Titre</div>
                    <div className="font-medium">{currentEvent?.title}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Description</div>
                    <div className="text-sm">{currentEvent?.description || 'Aucune description'}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Après */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="text-sm text-purple-600 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Après amélioration IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Titre</div>
                    <div className="font-medium text-purple-700">{currentEnhancement?.title}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Description</div>
                    <div className="text-sm">{currentEnhancement?.description}</div>
                  </div>
                  {currentEnhancement?.time && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Heure extraite
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {currentEnhancement.time}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-center">
              <Button onClick={onClose} variant="outline" disabled={applying}>
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleApplyChanges} disabled={applying}>
                {applying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                {applying ? 'Application...' : 'Appliquer les modifications'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhanceWithAIModal;