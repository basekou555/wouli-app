import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EventData {
  id: string;
  title: string;
  description?: string;
  date: string;
  location: string;
  image_url?: string;
  participants: number;
}

interface ReferrerProfile {
  id: string;
  username: string;
  avatar_url?: string;
}

const EventLanding = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const refUsername = searchParams.get('ref');

  const [event, setEvent] = useState<EventData | null>(null);
  const [referrer, setReferrer] = useState<ReferrerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      navigate(`/events/${id}`, { replace: true });
      return;
    }
    fetchData();
  }, [user, id]);

  const fetchData = async () => {
    if (!id) return;
    try {
      // Try business_events first, then events table
      const { data: bEvent } = await supabase
        .from('business_events')
        .select('id, title, description, date, time, venue, image_url, participants')
        .eq('id', id)
        .single();

      if (bEvent) {
        setEvent({
          id: bEvent.id,
          title: bEvent.title,
          description: bEvent.description,
          date: `${bEvent.date}T${bEvent.time}`,
          location: bEvent.venue,
          image_url: bEvent.image_url,
          participants: bEvent.participants || 0,
        });
      } else {
        const { data: uEvent } = await supabase
          .from('events')
          .select('id, title, description, date, location, image_url, participants')
          .eq('id', id)
          .single();

        if (uEvent) {
          setEvent({
            id: uEvent.id,
            title: uEvent.title,
            description: uEvent.description,
            date: uEvent.date,
            location: uEvent.location,
            image_url: uEvent.image_url,
            participants: uEvent.participants || 0,
          });
        }
      }

      // Fetch referrer profile if ref param present
      if (refUsername) {
        const { data: profile } = await supabase
          .from('public_profiles')
          .select('id, username, avatar_url')
          .eq('username', refUsername)
          .single();

        if (profile) setReferrer(profile);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (refUsername) {
      localStorage.setItem('pending_ref', refUsername);
      if (id) localStorage.setItem('pending_ref_event', id);
    }
    navigate('/auth', {
      state: {
        message: refUsername
          ? `Rejoins ${refUsername} sur Wouli pour participer à cet événement !`
          : 'Crée ton compte pour découvrir les meilleurs événements à Lyon.',
        type: 'info',
      },
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between border-b">
        <Link to="/">
          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Wouli
          </span>
        </Link>
        <Link to="/auth">
          <Button variant="outline" size="sm">Se connecter</Button>
        </Link>
      </header>

      {/* Referrer banner */}
      {referrer && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 px-4 py-3">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarImage src={referrer.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                {referrer.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-purple-700">{referrer.username}</span>
              {' '}t'a partagé cet événement
            </p>
          </div>
        </div>
      )}

      {/* Event content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {event ? (
          <>
            {/* Image */}
            {event.image_url && (
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event info */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>

              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar className="w-4 h-4 shrink-0 text-purple-500" />
                <span>{formatDate(event.date)}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 shrink-0 text-pink-500" />
                <span>{event.location}</span>
              </div>

              {event.participants > 0 && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Users className="w-4 h-4 shrink-0 text-orange-500" />
                  <span>{event.participants} participants</span>
                </div>
              )}

              {event.description && (
                <p className="text-gray-600 text-sm leading-relaxed pt-1">{event.description}</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Événement introuvable</p>
          </div>
        )}

        {/* CTA */}
        <div className="pt-4 space-y-3">
          <Button
            onClick={handleJoin}
            className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg"
          >
            {referrer ? (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Rejoindre {referrer.username} sur Wouli
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5 mr-2" />
                Voir sur Wouli
              </>
            )}
          </Button>
          <p className="text-center text-xs text-gray-400">
            Découvre les meilleurs événements à Lyon
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventLanding;
