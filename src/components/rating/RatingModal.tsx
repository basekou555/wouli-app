import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Calendar, MapPin, Clock } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { StarRating } from './StarRating';
import { formatDate, formatTime } from '@/utils/dateFormatting';
import { getProxiedImageUrl, handleImageError } from '@/utils/corsProxyHelpers';

interface RatingModalProps {
  isOpen: boolean;
  event: UnifiedEvent | null;
  isBlocking: boolean;
  canSkip: boolean;
  progress?: { current: number; total: number } | null;
  onSubmit: (rating: number, comment?: string, attended?: boolean) => Promise<boolean>;
  onSkip: () => void;
}

export const RatingModal = ({
  isOpen,
  event,
  isBlocking,
  canSkip,
  progress,
  onSubmit,
  onSkip
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (attended: boolean = true) => {
    if (attended && rating === 0) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(rating, comment.trim() || undefined, attended);
    
    if (success) {
      // Reset form
      setRating(0);
      setComment('');
    }
    
    setIsSubmitting(false);
  };

  if (!event) return null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={canSkip ? onSkip : undefined}
    >
      <DialogContent 
        className="max-w-md mx-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            {isBlocking ? "Notation obligatoire" : "Notez cet événement"}
          </DialogTitle>
          
          {progress && (
            <p className="text-sm text-muted-foreground text-center">
              Événement {progress.current} sur {progress.total}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {event.image_url && (
                  <img 
                    src={getProxiedImageUrl(event.image_url)} 
                    alt={event.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    onError={handleImageError}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight mb-2">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(event.date)}</span>
                      {event.time && (
                        <>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{formatTime(event.time)}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Section */}
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">
                Comment avez-vous trouvé cet événement ?
              </p>
              
              <StarRating 
                value={rating}
                onChange={setRating}
                size="lg"
              />
            </div>

            {/* Comment Section */}
            {rating > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Commentaire (optionnel)
                </label>
                <Textarea
                  placeholder="Partagez votre expérience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={300}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {comment.length}/300
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSubmit(true)}
              disabled={rating === 0 || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Envoi..." : "Valider ma notation"}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="w-full"
              size="sm"
            >
              Je n'ai pas participé à cet événement
            </Button>

            {canSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="w-full"
                size="sm"
              >
                Passer
              </Button>
            )}
          </div>

          {isBlocking && (
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Votre avis nous aide à améliorer l'expérience pour tous. 
              Cette notation est obligatoire pour accéder à l'application.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};