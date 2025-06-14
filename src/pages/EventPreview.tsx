
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock, Euro, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedEvent } from '@/types/unified';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const EventPreview = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<UnifiedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Try to find in business_events first
        const { data: businessEvent, error: businessError } = await supabase
          .from('business_events')
          .select('*')
          .eq('id', id)
          .single();

        if (businessEvent) {
          // Get business config for organizer name
          const { data: businessConfig } = await supabase
            .from('business_configs')
            .select('client_name')
            .eq('user_id', businessEvent.user_id)
            .single();

          const mappedEvent: UnifiedEvent = {
            id: businessEvent.id,
            title: businessEvent.title,
            description: businessEvent.description,
            date: `${businessEvent.date}T${businessEvent.time}`,
            location: businessEvent.venue,
            category: businessEvent.category,
            image_url: businessEvent.image_url,
            views: businessEvent.views || 0,
            likes: businessEvent.likes || 0,
            participants: businessEvent.participants || 0,
            created_at: businessEvent.created_at,
            updated_at: businessEvent.updated_at,
            source: 'business',
            organizer: businessConfig?.client_name || 'Établissement',
            organizer_type: 'business',
            venue: businessEvent.venue,
            time: businessEvent.time,
            event_type: businessEvent.event_type,
            price_text: businessEvent.price
          };
          
          setEvent(mappedEvent);
          return;
        }

        // If not found in business_events, try events table
        const { data: userEvent, error: userError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (userEvent) {
          const mappedEvent: UnifiedEvent = {
            id: userEvent.id,
            title: userEvent.title,
            description: userEvent.description,
            date: userEvent.date,
            location: userEvent.location,
            category: userEvent.category,
            image_url: userEvent.image_url,
            views: userEvent.views || 0,
            likes: userEvent.likes || 0,
            participants: userEvent.participants || 0,
            created_at: userEvent.created_at,
            updated_at: userEvent.updated_at,
            source: 'user',
            organizer: 'Utilisateur',
            organizer_type: 'user',
            end_date: userEvent.end_date,
            price_text: userEvent.price ? `${userEvent.price}€` : undefined,
            max_participants: userEvent.max_participants,
            address: userEvent.address,
            tags: userEvent.tags,
            external_url: userEvent.external_url
          };
          
          setEvent(mappedEvent);
          return;
        }

        setError('Événement non trouvé');
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Erreur lors du chargement de l\'événement');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleParticipate = () => {
    toast({
      title: "Intéressé par cet événement ?",
      description: "Téléchargez l'app Wouli pour participer !",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 w-full">
        <img
          src={event.image_url || "https://picsum.photos/800/400?random=event"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            <p className="text-lg opacity-90">Proposé par {event.organizer}</p>
            {event.source === 'business' && (
              <div className="mt-2">
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ★ Établissement Vérifié
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Event Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Détails de l'événement</h2>
                {event.description && (
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-orange-500" />
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-orange-500" />
                  <span>{event.location}</span>
                </div>

                {event.time && (
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-orange-500" />
                    <span>{event.time}</span>
                  </div>
                )}

                {event.price_text && (
                  <div className="flex items-center text-gray-700">
                    <Euro className="h-5 w-5 mr-3 text-orange-500" />
                    <span>{event.price_text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Engagement</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-500">{event.views}</div>
                    <div className="text-sm text-gray-600">Vues</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-500">{event.likes}</div>
                    <div className="text-sm text-gray-600">Likes</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-500">{event.participants}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleParticipate}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
                  size="lg"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Je participe !
                </Button>

                {event.external_url && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(event.external_url, '_blank')}
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Plus d'infos
                  </Button>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Découvrez plus d'événements sur
                </p>
                <div className="text-2xl font-bold text-orange-500">Wouli</div>
                <p className="text-xs text-gray-500">L'app pour découvrir et partager des sorties</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;
