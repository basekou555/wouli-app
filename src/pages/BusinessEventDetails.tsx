
import React from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Euro, ArrowLeft, Edit, Share2, ExternalLink, Eye, Heart, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BusinessEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get event from location state
  const event = location.state?.event;

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Événement introuvable</h2>
          <Button onClick={() => navigate('/business')}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/business/event/${id}/edit`, { state: { event } });
  };

  const handleShare = () => {
    const url = `${window.location.origin}/event/${id}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié !",
        description: "Le lien de l'événement a été copié dans le presse-papier",
      });
    }
  };

  const getLocationDisplay = () => {
    return event.custom_venue || event.venue || 'Lieu à définir';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/business')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-600 mt-2">{event.event_type}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button onClick={handleShare} variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event image */}
            {event.image_url && (
              <Card>
                <CardContent className="p-0">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Event details */}
            <Card>
              <CardHeader>
                <CardTitle>Détails de l'événement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-3 text-orange-500" />
                  <span>{event.time}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-orange-500" />
                  <span>{getLocationDisplay()}</span>
                </div>

                {event.price && (
                  <div className="flex items-center text-gray-700">
                    <Euro className="h-5 w-5 mr-3 text-orange-500" />
                    <span>{event.price}</span>
                  </div>
                )}

                {event.external_url && (
                  <div className="flex items-center text-gray-700">
                    <ExternalLink className="h-5 w-5 mr-3 text-orange-500" />
                    <a 
                      href={event.external_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Billeterie / Réservation
                    </a>
                  </div>
                )}

                {event.description && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-blue-500" />
                      <span>Vues</span>
                    </div>
                    <span className="font-bold text-lg">{event.views}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" />
                      <span>Likes</span>
                    </div>
                    <span className="font-bold text-lg">{event.likes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-green-500" />
                      <span>Participants</span>
                    </div>
                    <span className="font-bold text-lg">{event.participants}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={handleEdit} className="w-full" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier l'événement
                </Button>
                <Button onClick={handleShare} className="w-full" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager l'événement
                </Button>
                <Button 
                  asChild
                  className="w-full" 
                  variant="outline"
                >
                  <Link to={`/event/${id}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir en tant qu'utilisateur
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessEventDetails;
