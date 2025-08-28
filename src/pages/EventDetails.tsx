
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, MessageSquare, Share2, Users, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Event = Tables<'events'>;

interface EventWithCounts extends Event {
  likes_count?: number;
  participants_count?: number;
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const [event, setEvent] = useState<EventWithCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [interactionLoading, setInteractionLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }, []);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, []);

  const fetchEvent = async () => {
    if (!id) return;

    try {
      console.log('🔄 Récupération de l\'événement:', id);

      // Récupérer l'événement
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      if (!eventData) throw new Error('Event not found');

      // Récupérer le nombre total de likes
      const { count: likesCount, error: likesError } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      if (likesError) {
        console.error('❌ Erreur comptage likes:', likesError);
      }

      // Récupérer le nombre total de participants
      const { count: participantsCount, error: participantsError } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      if (participantsError) {
        console.error('❌ Erreur comptage participants:', participantsError);
      }

      // Mettre à jour l'événement avec les nouveaux compteurs
      const eventWithCounts: EventWithCounts = {
        ...eventData,
        likes_count: likesCount || 0,
        participants_count: participantsCount || 0
      };

      setEvent(eventWithCounts);

      console.log('📊 Événement récupéré avec compteurs:', {
        likes: likesCount,
        participants: participantsCount
      });

      // Incrémenter les vues seulement au premier chargement
      if (!event) {
        const newViews = (eventData.views || 0) + 1;
        await supabase
          .from('events')
          .update({ views: newViews })
          .eq('id', id);
      }

      // Vérifier si l'utilisateur a déjà interagi
      if (user) {
        const [likesResult, participantsResult] = await Promise.all([
          supabase
            .from('event_likes')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('event_participants')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .maybeSingle()
        ]);

        setHasLiked(!!likesResult.data);
        setHasParticipated(!!participantsResult.data);

        console.log('👤 Statut utilisateur:', {
          hasLiked: !!likesResult.data,
          hasParticipated: !!participantsResult.data
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'événement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger cet événement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = useCallback(async () => {
    if (!user || !event) {
      toast({
        title: "Connexion requise",
        description: "Connecte-toi pour aimer cet événement",
        variant: "destructive"
      });
      return;
    }

    setInteractionLoading(true);

    try {
      console.log('❤️ Tentative de like pour:', event.id, 'hasLiked:', hasLiked);

      if (hasLiked) {
        // Retirer le like
        const { error } = await supabase
          .from('event_likes')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setHasLiked(false);
        toast({
          title: "💔 Retiré des favoris",
          description: "L'événement a été retiré de tes favoris"
        });
      } else {
        // Ajouter le like
        const { error } = await supabase
          .from('event_likes')
          .insert({ event_id: event.id, user_id: user.id });

        if (error) throw error;

        setHasLiked(true);
        toast({
          title: "❤️ Ajouté aux favoris !",
          description: "L'événement a été ajouté à tes favoris"
        });
      }

      // Rafraîchir les données pour mettre à jour les compteurs
      await fetchEvent();
      
    } catch (error) {
      console.error('❌ Erreur lors du like:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'interaction",
        variant: "destructive"
      });
    } finally {
      setInteractionLoading(false);
    }
  }, [user, event, hasLiked, toast]);

  const handleParticipate = useCallback(async () => {
    if (!user || !event) {
      toast({
        title: "Connexion requise",
        description: "Connecte-toi pour participer à cet événement",
        variant: "destructive"
      });
      return;
    }

    setInteractionLoading(true);

    try {
      console.log('🎉 Tentative de participation pour:', event.id, 'hasParticipated:', hasParticipated);

      if (hasParticipated) {
        // Retirer la participation
        const { error } = await supabase
          .from('event_participants')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setHasParticipated(false);
        toast({
          title: "Participation annulée",
          description: "Tu ne participes plus à cet événement"
        });
      } else {
        // Ajouter la participation
        const { error } = await supabase
          .from('event_participants')
          .insert({ event_id: event.id, user_id: user.id, status: 'going' });

        if (error) throw error;

        setHasParticipated(true);
        toast({
          title: "🎉 Participation confirmée !",
          description: "Tu participes à cet événement"
        });
      }

      // Rafraîchir les données pour mettre à jour les compteurs
      await fetchEvent();
      
    } catch (error) {
      console.error('❌ Erreur lors de la participation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'interaction",
        variant: "destructive"
      });
    } finally {
      setInteractionLoading(false);
    }
  }, [user, event, hasParticipated, toast]);

  useEffect(() => {
    fetchEvent();
  }, [id, user]);

  if (loading) return <EventDetailsSkeleton />;
  if (!event) return (
    <div className="flex items-center justify-center min-h-96 text-muted-foreground">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">Événement non trouvé</p>
        <p className="text-sm">Cet événement n'existe pas ou a été supprimé</p>
      </div>
    </div>
  );

  return (
    <AppLayout>
      {isPreview && (
        <div className="border-l-4 border-amber-500 bg-amber-50 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-900">Aperçu public</p>
              <p className="text-sm text-amber-700">Ceci est un aperçu de l'événement</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Hero image - Priority visual element */}
        <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden bg-muted group">
          <img
            src={event.image_url || "https://picsum.photos/800/400?random=event"}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Floating metadata */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                {event.title}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">{event.location}</span>
                </div>
                {event.views && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{event.views} vues</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="xl:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-2 h-12 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="infos" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Informations
                </TabsTrigger>
                <TabsTrigger 
                  value="discussion"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Discussion
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="infos" className="space-y-6 animate-in fade-in-50 duration-300">
                <Card className="border-0 shadow-sm bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-foreground">À propos</h2>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {event.description || "Aucune description disponible pour cet événement."}
                      </p>
                      
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-4">
                          {event.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs font-medium hover:bg-secondary/80 transition-colors"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="discussion" className="animate-in fade-in-50 duration-300">
                <Card className="border-0 shadow-sm bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">Aucune discussion</h3>
                      <p className="text-muted-foreground">Soyez le premier à commenter cet événement</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar with event details */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm bg-background/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg text-foreground mb-6">Détails</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{formatDate(event.date)}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(event.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{event.location}</p>
                      {event.address && (
                        <p className="text-sm text-muted-foreground">{event.address}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {event.participants_count || 0} participant{(event.participants_count || 0) > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.likes_count || 0} like{(event.likes_count || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {event.price && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-600 font-bold text-lg">€</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{event.price}€</p>
                        <p className="text-sm text-muted-foreground">Prix d'entrée</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {!isPreview && (
              <div className="sticky top-6 space-y-3">
                <Button 
                  className="w-full h-12 text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md active:scale-95" 
                  size="lg"
                  onClick={handleParticipate}
                  variant={hasParticipated ? "outline" : "default"}
                  disabled={interactionLoading}
                >
                  {interactionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Chargement...</span>
                    </div>
                  ) : hasParticipated ? (
                    <div className="flex items-center gap-2">
                      <span>✅</span>
                      <span>Tu participes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>🗓️</span>
                      <span>Participer</span>
                    </div>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
                  onClick={handleLike}
                  disabled={interactionLoading}
                >
                  {interactionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Chargement...</span>
                    </div>
                  ) : hasLiked ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">❤️</span>
                      <span>Aimé</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>🤍</span>
                      <span>J'aime</span>
                    </div>
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full h-12 text-base font-medium transition-all duration-200 hover:bg-muted/60 active:scale-95"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Partager</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

// Dedicated skeleton for event details page
const EventDetailsSkeleton = React.memo(() => (
  <AppLayout>
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="aspect-[4/3] md:aspect-[16/9] rounded-2xl bg-muted" />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="xl:col-span-2 space-y-6">
          <div className="h-12 bg-muted rounded-lg" />
          <div className="bg-muted/60 rounded-xl p-6 space-y-4">
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="flex gap-2 pt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-16 bg-muted rounded-full" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <div className="bg-muted/60 rounded-xl p-6 space-y-6">
            <div className="h-6 bg-muted rounded w-1/3" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
));

export default EventDetails;
