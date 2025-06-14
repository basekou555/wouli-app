
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MapPin, Users, Eye, Building, Share2 } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';
import { getCategoryIcon } from '@/data/wouliCategories';
import { useNavigate } from 'react-router-dom';

interface SwipeCardProps {
  event: UnifiedEvent;
  onLike: () => void;
  onParticipate: () => void;
  onNext: () => void;
  onView: () => void;
  isLiked?: boolean;
  isParticipating?: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  event,
  onLike,
  onParticipate,
  onNext,
  onView,
  isLiked = false,
  isParticipating = false
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleViewDetails = () => {
    onView();
    navigate(`/events/${event.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.origin + `/events/${event.id}`
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API de partage
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto h-[600px] flex flex-col overflow-hidden shadow-lg">
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={event.image_url || "https://picsum.photos/400/300?random=event"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-white/90 text-xs">
            {getCategoryIcon(event.category)}
          </Badge>
        </div>
        {event.source === 'business' && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
              ★ Pro
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 line-clamp-2">{event.title}</h2>
            {event.description && (
              <p className="text-gray-600 text-sm mt-2 line-clamp-3">{event.description}</p>
            )}
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2" />
              <span className="font-medium">{event.organizer}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{event.views}</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{event.likes}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{event.participants}</span>
                </div>
              </div>
              {event.price_text && (
                <Badge variant="secondary" className="text-green-600">
                  {event.price_text}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-6">
          <div className="flex space-x-2">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={onLike}
              disabled={isLiked}
              className="flex-1"
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Aimé' : 'J\'aime'}
            </Button>
            <Button
              variant={isParticipating ? "default" : "outline"}
              size="sm"
              onClick={onParticipate}
              disabled={isParticipating}
              className="flex-1"
            >
              {isParticipating ? '✅ Inscrit' : 'Participer'}
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={handleViewDetails} className="flex-1">
              Voir détails
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onNext}>
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwipeCard;
