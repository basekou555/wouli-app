
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Euro, ExternalLink, Check, X, Clock, Filter, RefreshCw, AlertCircle, Instagram } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminProfileChecker from '@/components/AdminProfileChecker';
import { WOULI_CATEGORIES, getCategoryById } from '@/data/wouliCategories';

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
  image_url: string | null;
}

interface EventStats {
  pending: number;
  validated: number;
  rejected: number;
  todayValidated: number;
}

const ValidationInterface = () => {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [showDetails, setShowDetails] = useState<PendingEvent | null>(null);
  const [stats, setStats] = useState<EventStats>({
    pending: 0,
    validated: 0,
    rejected: 0,
    todayValidated: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingEvents();
    fetchStats();
    
    // Realtime subscription sur la table events
    const channel = supabase
      .channel('events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events'
        },
        () => {
          fetchPendingEvents();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingEvents(data || []);
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

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [pending, validated, rejected, todayValidated] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('events').select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('validated_at', `${today}T00:00:00.000Z`)
      ]);

      setStats({
        pending: pending.count || 0,
        validated: validated.count || 0,
        rejected: rejected.count || 0,
        todayValidated: todayValidated.count || 0
      });
    } catch (error) {
      console.error('Erreur fetch stats:', error);
    }
  };

  const handleApprove = async (eventIds: string | string[]) => {
    const idsToApprove = Array.isArray(eventIds) ? eventIds : [eventIds];
    setProcessingId('bulk');
    
    try {
      await Promise.all(
        idsToApprove.map(eventId => 
          supabase.rpc('approve_pending_event' as any, { p_event_id: eventId })
        )
      );

      toast({
        title: "✅ Événement(s) approuvé(s)",
        description: `${idsToApprove.length} événement(s) publié(s) avec succès`
      });

      setPendingEvents(prev => prev.filter(e => !idsToApprove.includes(e.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Erreur approbation:', error);
      toast({
        title: "Erreur d'approbation",
        description: "Impossible d'approuver ces événements",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (eventIds: string | string[]) => {
    const idsToReject = Array.isArray(eventIds) ? eventIds : [eventIds];
    setProcessingId('bulk');
    
    try {
      await Promise.all(
        idsToReject.map(eventId => 
          supabase.rpc('reject_pending_event' as any, { p_event_id: eventId })
        )
      );

      toast({
        title: "❌ Événement(s) rejeté(s)",
        description: `${idsToReject.length} événement(s) rejeté(s)`
      });

      setPendingEvents(prev => prev.filter(e => !idsToReject.includes(e.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Erreur rejet:', error);
      toast({
        title: "Erreur de rejet",
        description: "Impossible de rejeter ces événements",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Utility functions
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return 'Gratuit';
    return `${price}€`;
  };

  const getLinkLabel = (url: string | null) => {
    if (!url) return 'Lien externe';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('shotgun') || url.includes('dice') || url.includes('eventbrite') || url.includes('billetterie')) return 'Billetterie';
    return 'Lien externe';
  };

  const calculateScore = (event: PendingEvent) => {
    let score = 0;
    if (event.image_url) score += 2;
    if (event.external_url) score += 2;
    if (event.description && event.description.length > 100) score += 2;
    if (event.price !== null) score += 2;
    if (new Date(event.date) > new Date()) score += 2;
    return score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSelectAll = () => {
    const filtered = getFilteredEvents();
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(e => e.id)));
    }
  };

  const handleSelect = (eventId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedIds(newSelected);
  };

  const getFilteredEvents = () => {
    return pendingEvents
      .filter(event => filter === 'all' || event.category === filter)
      .sort((a, b) => {
        switch(sortBy) {
          case 'date': return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'score': return calculateScore(b) - calculateScore(a);
          case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default: return 0;
        }
      });
  };

  const filteredEvents = getFilteredEvents();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des événements en attente..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec stats */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Validation des Événements
              </h1>
              <p className="text-muted-foreground mt-1">
                Source : Propositions publiques • Modération du {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            
            <Button
              onClick={() => {
                fetchPendingEvents();
                fetchStats();
              }}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Stats rapides */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-sm text-orange-700">En attente</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
              <div className="text-sm text-green-700">Validés</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-red-700">Rejetés</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">+{stats.todayValidated}</div>
              <div className="text-sm text-purple-700">Aujourd'hui</div>
            </div>
          </div>
          
          {/* Contrôles */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Filtres catégories */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilter('all')}
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                >
                  Tous ({pendingEvents.length})
                </Button>
                {WOULI_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setFilter(category.id)}
                    variant={filter === category.id ? 'default' : 'outline'}
                    size="sm"
                  >
                    {category.icon} {category.name}
                  </Button>
                ))}
              </div>
              
              {/* Tri */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm bg-background"
              >
                <option value="date">Par date event</option>
                <option value="score">Par score</option>
                <option value="created">Plus récents</option>
              </select>
            </div>
            
            {/* Actions groupées */}
            <div className="flex gap-2">
              {selectedIds.size > 0 && (
                <span className="text-purple-600 font-medium px-3 py-2">
                  {selectedIds.size} sélectionné(s)
                </span>
              )}
              <Button
                onClick={() => handleApprove(Array.from(selectedIds))}
                disabled={selectedIds.size === 0 || processingId !== null}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Check className="w-4 h-4 mr-1" />
                Valider sélection
              </Button>
              <Button
                onClick={() => handleReject(Array.from(selectedIds))}
                disabled={selectedIds.size === 0 || processingId !== null}
                variant="destructive"
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                Rejeter sélection
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AdminProfileChecker />

        {/* Sélection globale */}
        {filteredEvents.length > 0 && (
          <div className="bg-card rounded-lg border p-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredEvents.length}
                onChange={handleSelectAll}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <span className="font-medium">Tout sélectionner</span>
            </label>
          </div>
        )}

        {/* Tableau des événements */}
        {processingId === 'bulk' ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Traitement en cours..." />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun événement en attente de validation</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-32">Image</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map(event => (
                  <TableRow key={event.id} className="hover:bg-muted/50">
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(event.id)}
                        onChange={() => handleSelect(event.id)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'}
                        alt={event.title}
                        className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => setShowDetails(event)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {event.title}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatEventDate(event.date)} à {formatEventTime(event.date)}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Euro className="w-4 h-4" />
                            {formatPrice(event.price)}
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge variant="secondary">
                            {getCategoryById(event.category)?.icon} {getCategoryById(event.category)?.name || event.category}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                      <div className="mt-2 flex gap-2">
                        {event.external_url && (
                          <a
                            href={event.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            {event.external_url.includes('instagram.com') ? (
                              <Instagram className="w-3 h-3" />
                            ) : (
                              <ExternalLink className="w-3 h-3" />
                            )}
                            {getLinkLabel(event.external_url)}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(calculateScore(event))}`}>
                        {calculateScore(event)}
                      </div>
                      <div className="text-xs text-muted-foreground">/ 10</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleApprove([event.id])}
                          disabled={processingId !== null}
                          size="icon"
                          variant="ghost"
                          className="text-green-600 hover:bg-green-50"
                        >
                          <Check className="w-5 h-5" />
                        </Button>
                        <Button
                          onClick={() => handleReject([event.id])}
                          disabled={processingId !== null}
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                        <Button
                          onClick={() => setShowDetails(event)}
                          size="icon"
                          variant="ghost"
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* Modal détails */}
      {showDetails && (
        <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={showDetails.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} 
                alt={showDetails.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            
            <DialogHeader>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <DialogTitle className="text-2xl font-bold">{showDetails.title}</DialogTitle>
                  <p className="text-muted-foreground mt-1">
                    {showDetails.submitter_email && `Proposé par : ${showDetails.submitter_email}`}
                  </p>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(calculateScore(showDetails))}`}>
                  {calculateScore(showDetails)}/10
                </span>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-5 h-5" />
                <span>{formatEventDate(showDetails.date)} à {formatEventTime(showDetails.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>{showDetails.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Euro className="w-5 h-5" />
                <span>{formatPrice(showDetails.price)}</span>
              </div>
            </div>
            
            {showDetails.description && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{showDetails.description}</p>
              </div>
            )}
            
            {showDetails.external_url && (
              <div className="flex gap-2 mb-6">
                <a
                  href={showDetails.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80"
                >
                  {showDetails.external_url.includes('instagram.com') ? (
                    <Instagram className="w-5 h-5" />
                  ) : (
                    <ExternalLink className="w-5 h-5" />
                  )}
                  {getLinkLabel(showDetails.external_url)}
                </a>
              </div>
            )}
            
            <div className="flex gap-2 pt-6 border-t">
              <Button
                onClick={() => {
                  handleApprove([showDetails.id]);
                  setShowDetails(null);
                }}
                disabled={processingId !== null}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-5 h-5 mr-2" />
                Valider
              </Button>
              <Button
                onClick={() => {
                  handleReject([showDetails.id]);
                  setShowDetails(null);
                }}
                disabled={processingId !== null}
                variant="destructive"
                className="flex-1"
              >
                <X className="w-5 h-5 mr-2" />
                Rejeter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ValidationInterface;
