
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, MessageSquare, Image, Share2, Users, Camera, Heart, User, ChevronDown, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import { useToast } from '@/hooks/use-toast';

type Event = Tables<'events'>;

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent(data);

        // Increment views
        await supabase.rpc('increment_event_views', { event_id: id });

        // Check if user has liked or participated
        if (user) {
          const [likesResult, participantsResult] = await Promise.all([
            supabase
              .from('event_likes')
              .select('id')
              .eq('event_id', id)
              .eq('user_id', user.id)
              .single(),
            supabase
              .from('event_participants')
              .select('id')
              .eq('event_id', id)
              .eq('user_id', user.id)
              .single()
          ]);

          setHasLiked(!!likesResult.data);
          setHasParticipated(!!participantsResult.data);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger cet événement",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleLike = async () => {
    if (!user || !event) {
      toast({
        title: "Connexion requise",
        description: "Connecte-toi pour aimer cet événement",
        variant: "destructive"
      });
      return;
    }

    try {
      if (hasLiked) {
        await supabase
          .from('event_likes')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
        setHasLiked(false);
        toast({
          title: "💔 Retiré des favoris",
          description: "L'événement a été retiré de tes favoris"
        });
      } else {
        await supabase
          .from('event_likes')
          .insert({ event_id: event.id, user_id: user.id });
        setHasLiked(true);
        toast({
          title: "❤️ Ajouté aux favoris !",
          description: "L'événement a été ajouté à tes favoris"
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleParticipate = async () => {
    if (!user || !event) {
      toast({
        title: "Connexion requise",
        description: "Connecte-toi pour participer à cet événement",
        variant: "destructive"
      });
      return;
    }

    try {
      if (hasParticipated) {
        await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
        setHasParticipated(false);
        toast({
          title: "Participation annulée",
          description: "Tu ne participes plus à cet événement"
        });
      } else {
        await supabase
          .from('event_participants')
          .insert({ event_id: event.id, user_id: user.id, status: 'going' });
        setHasParticipated(true);
        toast({
          title: "🎉 Participation confirmée !",
          description: "Tu participes à cet événement"
        });
      }
    } catch (error) {
      console.error('Error toggling participation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  if (loading) return <PageSkeleton />;
  if (!event) return <div className="p-8 text-center">Événement non trouvé</div>;

  return (
    <AppLayout>
      {isPreview && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-4">
          <div className="flex items-center">
            <Eye className="h-5 w-5 text-orange-500 mr-2" />
            <p className="text-orange-700 font-medium">
              Ceci est un aperçu public de l'événement
            </p>
          </div>
        </div>
      )}

      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-500 mt-1">📍 {event.location}</p>
          {event.views && (
            <p className="text-sm text-gray-400">{event.views} vues</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover image */}
            <div className="rounded-xl overflow-hidden h-60 md:h-80">
              <img
                src={event.image_url || "https://picsum.photos/800/400?random=event"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="infos">Infos</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>
              
              <TabsContent value="infos" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>À propos de cet événement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{event.description}</p>
                    {event.tags && event.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="discussion" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Discussion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune discussion pour le moment</p>
                      <p className="text-sm">Soyez le premier à commenter !</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-sm text-gray-500">{formatTime(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    {event.address && (
                      <p className="text-sm text-gray-500">{event.address}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{event.participants || 0} participants</p>
                    <p className="text-sm text-gray-500">{event.likes || 0} likes</p>
                  </div>
                </div>

                {event.price && (
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 font-medium">€</span>
                    <div>
                      <p className="font-medium">{event.price}€</p>
                      <p className="text-sm text-gray-500">Prix d'entrée</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {!isPreview && (
              <div className="sticky top-20 space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleParticipate}
                  variant={hasParticipated ? "outline" : "default"}
                >
                  {hasParticipated ? "✅ Tu participes" : "🗓️ Participer"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleLike}
                >
                  {hasLiked ? "❤️ Aimé" : "🤍 J'aime"}
                </Button>
                
                <Button variant="ghost" className="w-full">
                  <Share2 className="mr-2 h-4 w-4" />
                  Partager
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default EventDetails;
