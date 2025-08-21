import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Euro, ExternalLink, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminProfileChecker from '@/components/AdminProfileChecker';

interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  address: string | null;
  category: string;
  price: number | null;
  external_url: string | null;
  submitter_email: string | null;
  status: string;
  created_at: string;
}

const ValidationInterface = () => {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      console.log('🔍 Fetching pending events...');
      const { data, error } = await supabase
        .from('events_pending')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('📊 Query result:', { data, error });

      if (error) throw error;
      setPendingEvents(data || []);
      console.log('✅ Loaded', data?.length || 0, 'pending events');
    } catch (error) {
      console.error('❌ Erreur fetch events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements en attente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId: string, eventTitle: string) => {
    setProcessingId(eventId);
    try {
      // Use generic rpc call instead of typed function
      const { error } = await supabase.rpc('approve_pending_event' as any, {
        p_event_id: eventId
      });

      if (error) throw error;

      toast({
        title: "✅ Événement approuvé",
        description: `"${eventTitle}" a été publié avec succès`
      });

      // Retirer de la liste
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Erreur approbation:', error);
      toast({
        title: "Erreur d'approbation",
        description: "Impossible d'approuver cet événement",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (eventId: string, eventTitle: string) => {
    setProcessingId(eventId);
    try {
      // Use generic rpc call instead of typed function
      const { error } = await supabase.rpc('reject_pending_event' as any, {
        p_event_id: eventId
      });

      if (error) throw error;

      toast({
        title: "❌ Événement rejeté",
        description: `"${eventTitle}" a été rejeté`
      });

      // Retirer de la liste
      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Erreur rejet:', error);
      toast({
        title: "Erreur de rejet",
        description: "Impossible de rejeter cet événement",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      'a_boire': 'bg-blue-100 text-blue-800',
      'a_manger': 'bg-green-100 text-green-800',
      'soirees': 'bg-purple-100 text-purple-800',
      'activites': 'bg-orange-100 text-orange-800'
    };

    const categoryLabels: Record<string, string> = {
      'a_boire': '🍻 À boire',
      'a_manger': '🍽️ À manger',
      'soirees': '🎉 Soirées',
      'activites': '🎯 Activités'
    };

    return (
      <Badge className={categoryColors[category] || 'bg-gray-100 text-gray-800'}>
        {categoryLabels[category] || category}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des événements en attente..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Validation des événements</h1>
              <p className="text-muted-foreground mt-2">
                {pendingEvents.length} événement{pendingEvents.length !== 1 ? 's' : ''} en attente de validation
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              {pendingEvents.length} en attente
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Status Checker */}
        <AdminProfileChecker />

        {pendingEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold mb-2">Aucun événement en attente</h3>
              <p className="text-muted-foreground">
                Tous les événements soumis ont été traités. Revenez plus tard !
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        {event.price !== null && (
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            {event.price > 0 ? `${event.price}€` : 'Gratuit'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {getCategoryBadge(event.category)}
                        <Badge variant="secondary">
                          Soumis le {new Date(event.created_at).toLocaleDateString('fr-FR')}
                        </Badge>
                        {event.submitter_email && (
                          <Badge variant="outline">
                            {event.submitter_email}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {event.description && (
                    <p className="text-foreground mb-4 leading-relaxed">
                      {event.description}
                    </p>
                  )}

                  {event.address && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Adresse:</span>
                        <span>{event.address}</span>
                      </div>
                    </div>
                  )}

                  {event.external_url && (
                    <div className="mb-4">
                      <a
                        href={event.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Lien externe
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(event.id, event.title)}
                      disabled={processingId === event.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(event.id, event.title)}
                      disabled={processingId === event.id}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                    {processingId === event.id && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoadingSpinner size="sm" />
                        Traitement...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationInterface;
