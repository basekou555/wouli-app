import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/rating/StarRating';
import { BusinessEvent } from '@/types/events';
import { Calendar, MapPin, Eye, Heart, Users, MessageSquare, FileDown } from 'lucide-react';
import ProxiedImage from '@/components/ProxiedImage';

interface ArchivedEventCardProps {
  event: BusinessEvent;
}

export const ArchivedEventCard = ({ event }: ArchivedEventCardProps) => {
  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export PDF for event:', event.id);
  };

  const ratingCount = 0; // TODO: Get actual rating count
  const topComments = []; // TODO: Get actual comments

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {event.image_url && (
              <ProxiedImage 
                src={event.image_url} 
                alt={event.title}
                eventId={event.id}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{event.venue || event.custom_venue}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Archivé</Badge>
                {event.price && (
                  <Badge variant="outline">{event.price}</Badge>
                )}
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Metrics */}
          <div className="space-y-4">
            <h4 className="font-semibold">Métriques finales</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-muted-foreground mb-1">
                  <Eye className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold">{event.views}</p>
                <p className="text-xs text-muted-foreground">Vues</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-muted-foreground mb-1">
                  <Heart className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold">{event.likes}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold">{event.participants}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
            </div>
          </div>

          {/* Rating & Comments */}
          <div className="space-y-4">
            <h4 className="font-semibold">Avis des participants</h4>
            
            {event.average_rating && event.average_rating > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <StarRating 
                    value={event.average_rating} 
                    readonly 
                    size="sm" 
                  />
                  <span className="font-semibold">
                    {event.average_rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({ratingCount} avis)
                  </span>
                </div>

                {topComments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Meilleurs commentaires</span>
                    </p>
                    
                    {topComments.slice(0, 2).map((comment: any, index) => (
                      <div key={index} className="p-2 bg-muted rounded-lg">
                        <p className="text-sm italic">"{comment.text}"</p>
                        <div className="flex items-center mt-1">
                          <StarRating 
                            value={comment.rating} 
                            readonly 
                            size="sm" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aucun avis reçu pour cet événement
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};